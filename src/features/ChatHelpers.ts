import { IConversation, IParticipant, IReadState } from "../interfaces/ChatInterface";
import type { Translate } from "../i18n/translate";

export const FALLBACK_AVATAR =
    "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg";

// DM ditampilkan dengan identitas lawan bicara, grup dengan nama grupnya.
export const otherParticipant = (
    conversation: IConversation,
    myId: number
): IParticipant | undefined =>
    conversation.participants.find((participant) => participant.id !== myId);

export const conversationTitle = (conversation: IConversation, myId: number, t: Translate) => {
    if (conversation.is_group) return conversation.name || t("chat.group");
    return otherParticipant(conversation, myId)?.name || t("common.unknownUser");
};

// Id pesan terakhir yang sudah dibaca SEMUA lawan bicara — perhitungan yang
// sama dengan participantsAndReadCursor di backend. Di grup, centang dua baru
// muncul kalau semuanya sudah membaca, jadi yang dipakai batas terkecil; satu
// saja yang belum pernah membaca membuat hasilnya null.
export const readCursorFromReads = (reads: IReadState[] = [], myId: number) => {
    const others = reads.filter((read) => read.userId !== myId);
    if (!others.length) return null;

    let lowest: string | null = null;
    for (const read of others) {
        if (!read.last_read_message_id) return null;
        if (lowest === null || read.last_read_message_id < lowest) {
            lowest = read.last_read_message_id;
        }
    }
    return lowest;
};
