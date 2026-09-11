import { useDispatch } from "react-redux";
import { API } from "../libs/axios";
import {
  appendNotifications,
  setNotificationUnread,
  setNotifications,
} from "../slices/notificationSlice";

const NOTIFICATION_PAGE_SIZE = 20;

export const useNotificationHooks = () => {
  const dispatch = useDispatch();

  const authHeader = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  // Halaman pertama. Mengembalikan apakah masih ada halaman berikutnya.
  const fetchNotifications = async () => {
    const response = await API.get("/notifications", {
      headers: authHeader(),
      params: { limit: NOTIFICATION_PAGE_SIZE },
    });
    dispatch(setNotifications(response.data.data));
    return Boolean(response.data.hasMore);
  };

  const fetchMoreNotifications = async (beforeId: string) => {
    const response = await API.get("/notifications", {
      headers: authHeader(),
      params: { limit: NOTIFICATION_PAGE_SIZE, before: beforeId },
    });
    dispatch(appendNotifications(response.data.data));
    return Boolean(response.data.hasMore);
  };

  const fetchNotificationUnread = async () => {
    try {
      const response = await API.get("/notifications/unread-count", {
        headers: authHeader(),
      });
      dispatch(setNotificationUnread(response.data.unread));
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  // Badge langsung nol tanpa menunggu server; kalau request-nya gagal,
  // hitungan berikutnya dari server akan mengembalikan angka yang benar.
  const markNotificationsRead = async () => {
    dispatch(setNotificationUnread(0));
    try {
      await API.patch("/notifications/read", {}, { headers: authHeader() });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return {
    fetchNotifications,
    fetchMoreNotifications,
    fetchNotificationUnread,
    markNotificationsRead,
  };
};
