/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { connectSocket, getSocket } from "../libs/socket";
import { useChatHooks } from "./chat";
import { useDispatch } from "react-redux";
import {
    applyConversationRead,
    markConversationRead,
    syncPresence,
    updatePresence,
} from "../slices/chatSlice";
import { readCursorFromReads } from "../features/ChatHelpers";

// Dipasang SEKALI di MainLayout. Menjaga koneksi tetap hidup lintas halaman dan
// memperbarui daftar percakapan serta badge saat ada pesan masuk.
export const useChatSocket = () => {
    const { fetchConversations } = useChatHooks();
    const dispatch = useDispatch();
    const token = sessionStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        const socket = connectSocket(token);

        // Handler didefinisikan di dalam effect supaya referensinya sama persis
        // saat dilepas; tanpa itu listener menumpuk tiap kali reconnect.
        //
        // Satu kejadian bisa memicu beberapa event berturut-turut (mengirim
        // pesan beruntun, forward ke banyak tujuan), jadi digabung jadi satu
        // request. fetchConversations sekaligus menghitung ulang badge unread,
        // jadi /unread-count tidak perlu ikut dipanggil.
        let refreshTimer: ReturnType<typeof setTimeout> | undefined;
        const onConversationUpdated = () => {
            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(fetchConversations, 300);
        };

        // Setelah terputus (misalnya Render tidur), keadaan bisa sudah berubah.
        const onConnect = () => fetchConversations();

        // Status baca berubah di salah satu percakapan kita. Diterapkan
        // langsung ke daftar, tanpa mengambil ulang dari server.
        const onRead = (payload: any) => {
            const myId = Number(sessionStorage.getItem("id"));

            // Kita sendiri yang membaca, misalnya di tab lain: badge ikut hilang.
            if (payload.userId === myId) {
                dispatch(markConversationRead(payload.conversationId));
                return;
            }

            dispatch(
                applyConversationRead({
                    conversationId: payload.conversationId,
                    cursor: readCursorFromReads(payload.reads, myId),
                })
            );
        };

        const onPresenceSync = (payload: any) =>
            dispatch(syncPresence(payload.userIds || []));
        const onPresenceUpdate = (payload: any) => dispatch(updatePresence(payload));

        socket.on("connect", onConnect);
        socket.on("chat:conversation-updated", onConversationUpdated);
        socket.on("chat:read", onRead);
        socket.on("presence:sync", onPresenceSync);
        socket.on("presence:update", onPresenceUpdate);

        return () => {
            socket.off("connect", onConnect);
            socket.off("chat:conversation-updated", onConversationUpdated);
            socket.off("chat:read", onRead);
            socket.off("presence:sync", onPresenceSync);
            socket.off("presence:update", onPresenceUpdate);
            clearTimeout(refreshTimer);
            // Sengaja TIDAK disconnect: koneksinya dipakai lintas halaman.
            // Pemutusan hanya saat logout.
        };
    }, [token]);
};

// Dipasang di halaman ruang chat: masuk ke room percakapan dan menerima
// pesan baru, penghapusan, serta perubahan status baca.
export const useConversationRoom = (
    conversationId: string,
    handlers: {
        onMessage: (payload: any) => void;
        onMessagesDeleted: (payload: any) => void;
        onRead: (payload: any) => void;
    }
) => {
    useEffect(() => {
        const socket = getSocket();
        if (!socket || !conversationId) return;

        // Setelah reconnect, socket id-nya baru dan seluruh keanggotaan room
        // hilang, jadi join harus diulang. Pesan yang terlewat selama putus
        // tidak pernah dikirim ulang oleh Socket.IO, karena itu isi percakapan
        // ikut diambil ulang di sini.
        const join = () => {
            socket.emit("chat:join", { conversationId });
            handlers.onMessage({ conversationId, refetch: true });
        };

        const onMessage = (payload: any) => {
            if (String(payload?.conversationId) !== conversationId) return;
            handlers.onMessage(payload);
        };

        const onMessagesDeleted = (payload: any) => {
            if (String(payload?.conversationId) !== conversationId) return;
            handlers.onMessagesDeleted(payload);
        };

        const onRead = (payload: any) => {
            if (String(payload?.conversationId) !== conversationId) return;
            handlers.onRead(payload);
        };

        if (socket.connected) socket.emit("chat:join", { conversationId });
        socket.on("connect", join);
        socket.on("chat:message", onMessage);
        socket.on("chat:messages-deleted", onMessagesDeleted);
        socket.on("chat:read", onRead);

        return () => {
            socket.off("connect", join);
            socket.off("chat:message", onMessage);
            socket.off("chat:messages-deleted", onMessagesDeleted);
            socket.off("chat:read", onRead);
            socket.emit("chat:leave", { conversationId });
        };
    }, [conversationId]);
};
