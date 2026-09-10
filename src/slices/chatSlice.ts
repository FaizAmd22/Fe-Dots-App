/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    conversations: [] as any[],
    messages: [] as any[],
    // Percakapan yang sedang dibuka. Setiap aksi yang membawa pesan menyertakan
    // id percakapannya dan diabaikan kalau tidak cocok: respons dari percakapan
    // sebelumnya bisa datang telat setelah user pindah, dan tanpa penjaga ini
    // pesannya tercampur ke percakapan yang baru dibuka.
    activeConversationId: null as string | null,
    // Id pesan terakhir yang sudah dibaca SEMUA lawan bicara di percakapan yang
    // sedang dibuka. Pesan sendiri dengan id <= ini bercentang dua.
    readCursor: null as string | null,
    unreadTotal: 0,
    // id user yang sedang online, dan waktu terakhir online yang diketahui.
    onlineUserIds: [] as number[],
    lastSeenById: {} as Record<number, string | null>,
};

type RoomState = {
    activeConversationId: string | null;
    readCursor: string | null;
    messages: any[];
};

// Urutan pesan memakai id, bukan created_at, karena dua pesan bisa punya
// timestamp yang sama persis.
//
// Id pesan kini UUID v7 yang terurut menurut waktu, jadi perbandingan teks biasa
// sudah mencerminkan urutan kirim. Pesan yang belum sampai server diberi id
// sementara berawalan "pending-" dan selalu ditaruh paling akhir, karena memang
// itu yang paling baru.
const rankOf = (message: any) => (message.pending ? "\uffff" : String(message.id));

const compareMessages = (a: any, b: any) => {
    const left = rankOf(a);
    const right = rankOf(b);
    return left < right ? -1 : left > right ? 1 : 0;
};

const isActive = (state: RoomState, conversationId: string) =>
    state.activeConversationId === String(conversationId);

// Kursor baca hanya boleh maju. Event socket dan respons HTTP bisa tiba tidak
// berurutan, dan kursor lama yang datang belakangan tidak boleh mengubah centang
// dua kembali jadi satu — ini yang dulu membuat centang dua kadang tidak muncul.
const laterCursor = (current: string | null, next: string | null) => {
    if (!current) return next;
    if (!next) return current;
    return next > current ? next : current;
};

// Menandai pesan yang sudah terbaca menurut kursor saat ini. Hanya menaikkan
// status, tidak pernah menurunkan, dengan alasan yang sama seperti di atas.
// Pesan orang lain ikut tertandai, tapi tidak apa-apa: centang hanya
// ditampilkan untuk pesan sendiri.
const applyReadCursor = (state: RoomState) => {
    const cursor = state.readCursor;
    if (!cursor) return;

    state.messages.forEach((message: any) => {
        if (!message.pending && !message.isRead && String(message.id) <= cursor) {
            message.isRead = true;
        }
    });
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setConversations: (state, action) => {
            // Percakapan yang sedang terbuka sedang dibaca, jadi tidak pernah
            // punya pesan belum dibaca. Tanpa ini, daftar yang terambil sebelum
            // markAsRead selesai di server bisa menahan badge di angka lama.
            const conversations: any[] = action.payload.map((conversation: any) =>
                isActive(state, conversation.id)
                    ? { ...conversation, unreadCount: 0 }
                    : conversation
            );

            state.conversations = conversations;
            // Total badge dihitung dari daftar yang sama, jadi tidak perlu
            // request /unread-count terpisah setiap kali daftar diperbarui.
            state.unreadTotal = conversations.reduce(
                (total, conversation) => total + (conversation.unreadCount || 0),
                0
            );
        },
        // Dipanggil saat membuka ruang chat: pesan percakapan sebelumnya dibuang
        // supaya tidak sempat tampil di percakapan yang baru.
        openRoom: (state, action) => {
            state.activeConversationId = String(action.payload);
            state.messages = [];
            state.readCursor = null;
        },
        closeRoom: (state, action) => {
            if (isActive(state, action.payload)) state.activeConversationId = null;
        },
        // Halaman pertama saat percakapan dibuka.
        setMessages: (state, action) => {
            const { conversationId, messages, readCursor } = action.payload;
            if (!isActive(state, conversationId)) return;

            const incoming: any[] = messages;
            const incomingIds = new Set(incoming.map((message) => message.id));
            const clientIds = new Set(
                incoming.map((message) => message.client_id).filter(Boolean)
            );
            const newestIncoming = incoming.length
                ? String(incoming[incoming.length - 1].id)
                : "";

            // Yang sudah ada di layar sebelum respons ini datang tetap dipakai:
            // pesan yang sedang terkirim, dan pesan dari socket yang tiba selagi
            // halaman ini dimuat (lebih baru dari isi respons).
            const kept = state.messages.filter((message: any) =>
                message.pending
                    ? !clientIds.has(message.client_id)
                    : !incomingIds.has(message.id) && String(message.id) > newestIncoming
            );

            state.messages = [...incoming, ...kept].sort(compareMessages);
            state.readCursor = laterCursor(state.readCursor, readCursor ?? null);
            applyReadCursor(state);
        },
        // Menyisipkan satu pesan sambil menjaga dua hal: tidak ada pesan dobel,
        // dan urutannya tetap menaik menurut id. Dipakai saat mengirim pesan
        // dan saat pesan masuk lewat socket.
        appendMessage: (state, action) => {
            const { conversationId, message } = action.payload;
            if (!isActive(state, conversationId)) return;

            const messages: any[] = state.messages;

            // Pesan sementara yang sudah tampil diganti dengan versi dari server,
            // dikenali lewat client_id. Tanpa ini pesannya akan tampil dua kali.
            const pendingIndex = message.client_id
                ? messages.findIndex((item: any) => item.client_id === message.client_id)
                : -1;

            if (pendingIndex !== -1) {
                messages[pendingIndex] = message;
            } else if (!messages.some((item: any) => item.id === message.id)) {
                messages.push(message);
            } else {
                return;
            }

            // Id-nya bisa baru saja jadi asli, jadi posisinya ditata ulang kalau
            // sempat ada pesan lain masuk sementara yang ini masih terkirim.
            messages.sort(compareMessages);
            // Kalau lawan bicara sudah membaca SEBELUM respons POST sampai (sering
            // terjadi: event socket lebih cepat dari respons HTTP), kursornya sudah
            // tersimpan dan pesan ini langsung bercentang dua.
            applyReadCursor(state);
        },
        // Halaman pesan yang lebih lama (infinite scroll ke atas): disisipkan
        // di depan tanpa menyentuh pesan yang sudah tampil.
        prependMessages: (state, action) => {
            const { conversationId, messages } = action.payload;
            if (!isActive(state, conversationId)) return;

            const existing = new Set(state.messages.map((message: any) => message.id));
            const older = messages.filter((message: any) => !existing.has(message.id));
            state.messages = [...older, ...state.messages].sort(compareMessages);
            applyReadCursor(state);
        },
        // Halaman terbaru dari server digabungkan ke yang sudah tampil. Dipakai
        // setelah reconnect atau forward: mengganti seluruh daftar akan membuang
        // halaman lama yang sudah dimuat lewat infinite scroll.
        mergeMessages: (state, action) => {
            const { conversationId, messages, readCursor } = action.payload;
            if (!isActive(state, conversationId)) return;

            const incoming: any[] = messages;
            const incomingIds = new Set(incoming.map((message) => message.id));
            const clientIds = new Set(
                incoming.map((message) => message.client_id).filter(Boolean)
            );

            // Versi server menggantikan versi lama pesan yang sama, termasuk
            // pesan sementara yang dikenali lewat client_id.
            const kept = state.messages.filter(
                (message: any) =>
                    !incomingIds.has(message.id) &&
                    !(message.pending && clientIds.has(message.client_id))
            );

            state.messages = [...kept, ...incoming].sort(compareMessages);
            state.readCursor = laterCursor(state.readCursor, readCursor ?? null);
            applyReadCursor(state);
        },
        // Lawan bicara membaca (event socket "chat:read"): centang di layar
        // berubah tanpa mengambil ulang daftar pesan.
        advanceReadCursor: (state, action) => {
            const { conversationId, cursor } = action.payload;
            if (!isActive(state, conversationId)) return;

            state.readCursor = laterCursor(state.readCursor, cursor);
            applyReadCursor(state);
        },
        // Menghapus pesan dari layar setelah dihapus di server.
        removeMessagesByIds: (state, action) => {
            const ids: string[] = action.payload;
            state.messages = state.messages.filter(
                (message: any) => !ids.includes(message.id)
            );
        },
        // Menghapus pesan sementara yang gagal terkirim.
        removeMessageByClientId: (state, action) => {
            state.messages = state.messages.filter(
                (message: any) => message.client_id !== action.payload
            );
        },
        // Kita membaca percakapan ini: angka unread-nya langsung nol tanpa
        // menunggu daftar percakapan diambil ulang.
        markConversationRead: (state, action) => {
            const conversation = state.conversations.find(
                (item: any) => item.id === String(action.payload)
            );
            if (!conversation || !conversation.unreadCount) return;

            state.unreadTotal = Math.max(0, state.unreadTotal - conversation.unreadCount);
            conversation.unreadCount = 0;
        },
        // Lawan bicara membaca: centang pesan terakhir di daftar percakapan ikut
        // berubah, walau ruang chat-nya sedang tidak dibuka.
        applyConversationRead: (state, action) => {
            const { conversationId, cursor } = action.payload;
            const conversation = state.conversations.find(
                (item: any) => item.id === String(conversationId)
            );
            const lastMessage = conversation?.lastMessage;
            if (!lastMessage || !cursor) return;

            if (String(lastMessage.id) <= cursor) lastMessage.isRead = true;
        },
        // Daftar lengkap saat socket baru tersambung.
        syncPresence: (state, action) => {
            state.onlineUserIds = action.payload;
        },
        // Satu user berubah status.
        updatePresence: (state, action) => {
            const { userId, isOnline, last_seen_at } = action.payload;
            const others = state.onlineUserIds.filter((id: number) => id !== userId);

            state.onlineUserIds = isOnline ? [...others, userId] : others;
            if (last_seen_at) state.lastSeenById[userId] = last_seen_at;
        },
        setUnreadTotal: (state, action) => {
            state.unreadTotal = action.payload;
        },
    },
});

export const {
    setConversations,
    openRoom,
    closeRoom,
    setMessages,
    appendMessage,
    prependMessages,
    mergeMessages,
    advanceReadCursor,
    removeMessageByClientId,
    removeMessagesByIds,
    markConversationRead,
    applyConversationRead,
    syncPresence,
    updatePresence,
    setUnreadTotal,
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectConversations = (state: any) => state.chat.conversations;
export const selectMessages = (state: any) => state.chat.messages;
export const selectUnreadTotal = (state: any) => state.chat.unreadTotal;
export const selectOnlineUserIds = (state: any) => state.chat.onlineUserIds;
export const selectLastSeenById = (state: any) => state.chat.lastSeenById;
