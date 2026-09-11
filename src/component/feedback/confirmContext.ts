import { createContext, ReactElement } from "react";
import type { ConfirmTone } from "./ConfirmDialog";

export interface ConfirmOptions {
  title: string;
  description?: string;
  // Default: "Ya" / "Batal" sesuai bahasa aktif.
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
  icon?: ReactElement;
  // Kalau diisi, dialog tetap terbuka dengan spinner di tombol konfirmasi
  // sampai proses ini selesai (misalnya request hapus).
  onConfirm?: () => Promise<void> | void;
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);
