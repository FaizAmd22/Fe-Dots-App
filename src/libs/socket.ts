import { io, Socket } from "socket.io-client";

// VITE_BASE_URL sudah mengandung "/api/v1", sedangkan Socket.IO butuh origin
// murni. Kalau VITE_SOCKET_URL tidak diset, path itu dipotong otomatis supaya
// tidak wajib menambah env baru.
const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
  (import.meta.env.VITE_BASE_URL as string).replace(/\/api\/v1\/?$/, "");

let socket: Socket | null = null;

export const getSocket = () => socket;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    // Default 20 detik lebih pendek dari cold start Render yang terukur ~22
    // detik, jadi koneksi pertama setelah server tidur akan selalu gagal.
    timeout: 30000,
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
