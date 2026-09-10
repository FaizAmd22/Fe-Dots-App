/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from "react-redux";
import { API } from "../libs/axios";
import {
    appendMessage,
    mergeMessages,
    prependMessages,
    removeMessageByClientId,
    removeMessagesByIds,
    setConversations,
    setMessages,
    setUnreadTotal,
} from "../slices/chatSlice";

// Jumlah pesan per halaman. Membuka percakapan cukup menunggu satu halaman;
// sisanya dimuat saat user menggulir ke atas.
const MESSAGE_PAGE_SIZE = 30;

export const useChatHooks = () => {
    const token = sessionStorage.getItem("token");
    const dispatch = useDispatch();

    const authHeader = () => ({ Authorization: `Bearer ${token}` });

    const fetchConversations = async () => {
        try {
            const response = await API.get("/conversations", { headers: authHeader() });
            // Sekaligus menghitung ulang badge unread dari daftar yang sama.
            dispatch(setConversations(response.data.data));
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    // Halaman pertama (pesan terbaru). Mengembalikan apakah masih ada pesan
    // yang lebih lama untuk dimuat lewat infinite scroll.
    const fetchMessages = async (conversationId: string) => {
        const response = await API.get(`/conversations/${conversationId}/messages`, {
            headers: authHeader(),
            params: { limit: MESSAGE_PAGE_SIZE },
        });
        dispatch(
            setMessages({
                conversationId,
                messages: response.data.data,
                readCursor: response.data.readCursor ?? null,
            })
        );
        return Boolean(response.data.hasMore);
    };

    // Halaman berikutnya ke arah pesan yang lebih lama.
    const fetchOlderMessages = async (conversationId: string, beforeId: string) => {
        const response = await API.get(`/conversations/${conversationId}/messages`, {
            headers: authHeader(),
            params: { limit: MESSAGE_PAGE_SIZE, before: beforeId },
        });
        dispatch(prependMessages({ conversationId, messages: response.data.data }));
        return Boolean(response.data.hasMore);
    };

    // Menyegarkan halaman terbaru tanpa membuang halaman lama yang sudah dimuat.
    const refreshLatestMessages = async (conversationId: string) => {
        try {
            const response = await API.get(`/conversations/${conversationId}/messages`, {
                headers: authHeader(),
                params: { limit: MESSAGE_PAGE_SIZE },
            });
            dispatch(
                mergeMessages({
                    conversationId,
                    messages: response.data.data,
                    readCursor: response.data.readCursor ?? null,
                })
            );
        } catch (error) {
            console.error("Error refreshing messages:", error);
        }
    };

    // Dipakai baik untuk DM maupun grup. Untuk DM backend mengembalikan
    // percakapan lama kalau sudah pernah ada, jadi aman dipanggil berkali-kali.
    const createConversation = async (participantIds: number[], name?: string) => {
        const response = await API.post(
            "/conversations",
            { participantIds, name },
            { headers: authHeader() }
        );
        return response.data.data.id as number;
    };

    const sendMessage = async (
        conversationId: string,
        payload: { content?: string; images?: File[]; client_id: string }
    ) => {
        const images = payload.images || [];
        // Pesan langsung ditampilkan dengan id sementara sebelum request selesai,
        // supaya mengirim terasa seketika. Pesan ini diganti versi server begitu
        // responsnya datang (dicocokkan lewat client_id).
        dispatch(
            appendMessage({
                conversationId,
                message: {
                    // Berawalan "pending-" supaya mustahil bentrok dengan UUID asli
                    // dan selalu terbaca sebagai pesan paling baru saat diurutkan.
                    id: `pending-${payload.client_id}`,
                    content: payload.content || null,
                    images: images.map((image) => URL.createObjectURL(image)),
                    image: images.length ? URL.createObjectURL(images[0]) : null,
                    client_id: payload.client_id,
                    is_forwarded: false,
                    created_at: new Date().toISOString(),
                    isRead: false,
                    pending: true,
                    sender: {
                        id: Number(sessionStorage.getItem("id")),
                        name: "",
                        username: "",
                    },
                },
            })
        );

        // FormData sungguhan: beberapa gambar memakai nama field yang sama
        // ("image"), dan objek biasa tidak bisa menyatakan hal itu.
        const body = new FormData();
        if (payload.content) body.append("content", payload.content);
        body.append("client_id", payload.client_id);
        images.forEach((image) => body.append("image", image));

        try {
            const response = await API.post(
                `/conversations/${conversationId}/messages`,
                body,
                {
                    headers: {
                        ...authHeader(),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            dispatch(appendMessage({ conversationId, message: response.data.data }));
        } catch (error) {
            // Gagal terkirim: tarik kembali pesan sementaranya supaya tidak
            // terlihat seolah sudah sampai.
            dispatch(removeMessageByClientId(payload.client_id));
            throw error;
        }
    };

    // scope "me" menyembunyikan hanya untuk kita, "everyone" menghapus permanen
    // dan hanya berlaku untuk pesan sendiri.
    const deleteMessages = async (
        conversationId: string,
        messageIds: string[],
        scope: "me" | "everyone"
    ) => {
        await API.post(
            `/conversations/${conversationId}/messages/delete`,
            { messageIds, scope },
            { headers: authHeader() }
        );
        dispatch(removeMessagesByIds(messageIds));
    };

    const forwardMessages = async (
        messageIds: string[],
        targets: { conversationIds?: string[]; userIds?: number[] }
    ) => {
        await API.post(
            "/conversations/messages/forward",
            {
                messageIds,
                conversationIds: targets.conversationIds || [],
                userIds: targets.userIds || [],
            },
            { headers: authHeader() }
        );
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await API.patch(`/conversations/${conversationId}/read`, {}, { headers: authHeader() });
        } catch (error) {
            console.error("Error marking conversation as read:", error);
        }
    };

    const fetchUnreadTotal = async () => {
        try {
            const response = await API.get("/conversations/unread-count", { headers: authHeader() });
            dispatch(setUnreadTotal(response.data.data.unread));
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    return {
        fetchConversations,
        fetchMessages,
        fetchOlderMessages,
        refreshLatestMessages,
        createConversation,
        sendMessage,
        deleteMessages,
        forwardMessages,
        markAsRead,
        fetchUnreadTotal,
    };
};
