export interface IParticipant {
    id: number
    name: string
    username: string
    picture?: string
    isOnline?: boolean
    last_seen_at?: string | null
}

export interface IMessage {
    id: string
    content: string | null
    images: string[]
    // Dipertahankan untuk kompatibilitas; gambar pertama dari images.
    image: string | null
    client_id: string | null
    // Pesan ini lahir dari forward.
    is_forwarded: boolean
    created_at: string
    // Sudah dibaca semua lawan bicara. Hanya bermakna untuk pesan sendiri.
    isRead: boolean
    // Hanya ada di sisi klien: pesan sudah tampil tapi belum sampai ke server.
    pending?: boolean
    sender: IParticipant | null
}

// Batas baca satu peserta, dikirim server lewat event socket "chat:read".
export interface IReadState {
    userId: number
    last_read_message_id: string | null
}

export interface ILastMessage {
    id: string
    content: string | null
    image: string | null
    created_at: string
    senderId: number | null
    // Sudah dibaca semua lawan bicara. Hanya bermakna kalau pengirimnya kita.
    isRead: boolean
}

export interface IConversation {
    id: string
    is_group: boolean
    name: string | null
    created_at: string
    last_message_at: string
    unreadCount: number
    participants: IParticipant[]
    lastMessage: ILastMessage | null
}
