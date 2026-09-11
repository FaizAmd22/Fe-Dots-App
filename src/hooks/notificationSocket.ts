/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectSocket } from "../libs/socket";
import { useNotificationHooks } from "./notification";
import { setNotificationUnread } from "../slices/notificationSlice";

// Dipasang SEKALI di MainLayout. Memakai koneksi socket yang sama dengan chat;
// yang diurus di sini hanya badge. Daftar di halaman notifikasi mendengarkan
// event yang sama secara terpisah.
export const useNotificationSocket = () => {
  const { fetchNotificationUnread } = useNotificationHooks();
  const dispatch = useDispatch();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    // Like/unlike beruntun memicu banyak event; cukup satu request di akhir.
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const onChanged = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(fetchNotificationUnread, 300);
    };

    // Dibaca di tab lain milik user yang sama.
    const onRead = () => dispatch(setNotificationUnread(0));

    // Setelah terputus, notifikasi bisa sudah bertambah.
    socket.on("connect", onChanged);
    socket.on("notification:changed", onChanged);
    socket.on("notification:read", onRead);

    return () => {
      socket.off("connect", onChanged);
      socket.off("notification:changed", onChanged);
      socket.off("notification:read", onRead);
      clearTimeout(refreshTimer);
    };
  }, [token]);
};
