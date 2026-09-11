export type NotificationType = "follow" | "like_thread" | "like_reply" | "reply";

export interface INotificationActor {
  id: number;
  name: string;
  username: string;
  picture?: string | null;
}

export interface INotificationPreview {
  id: string;
  content?: string | null;
  image?: string | null;
}

// Satu item = satu KELOMPOK kejadian ("A dan 3 lainnya menyukai ..."). id-nya
// adalah id kejadian terbaru di kelompok itu, sekaligus kursor halaman.
export interface INotification {
  id: string;
  type: NotificationType;
  // Maksimal 3 user terbaru; jumlah seluruhnya ada di actorCount.
  actors: INotificationActor[];
  actorCount: number;
  isRead: boolean;
  created_at: string;
  thread: INotificationPreview | null;
  // like_reply: reply yang disukai. reply: isi balasannya.
  reply: INotificationPreview | null;
}
