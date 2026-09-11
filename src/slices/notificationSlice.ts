/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { INotification } from "../interfaces/NotificationInterface";

const initialState = {
  items: [] as INotification[],
  unreadCount: 0,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
    },
    // Halaman berikutnya dari infinite scroll. Kelompok yang sudah tampil
    // dilewati, jaga-jaga kalau batas halamannya bergeser.
    appendNotifications: (state, action) => {
      const known = new Set(state.items.map((item) => item.id));
      state.items.push(
        ...action.payload.filter((item: INotification) => !known.has(item.id))
      );
    },
    setNotificationUnread: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
});

export const { setNotifications, appendNotifications, setNotificationUnread } =
  notificationSlice.actions;

export default notificationSlice.reducer;

export const selectNotifications = (state: any): INotification[] =>
  state.notification.items;
export const selectNotificationUnread = (state: any): number =>
  state.notification.unreadCount;
