/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, GridItem } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useChatHooks } from "../hooks/chat";
import { useChatSocket } from "../hooks/chatSocket";
import { useNotificationHooks } from "../hooks/notification";
import { useNotificationSocket } from "../hooks/notificationSocket";
import MobileNavbar from "../component/navbar/components/MobileNavbar";
import Navbar from "../component/navbar/index";
import SideProfile from "../component/sideProfile/index";

// Pembaruan utama datang dari socket. Interval ini tinggal jaring pengaman
// kalau koneksi socket sedang putus, jadi jaraknya dilonggarkan.
const UNREAD_REFRESH_MS = 120000;

function MainLayout() {
  const { fetchUnreadTotal } = useChatHooks();
  const { fetchNotificationUnread } = useNotificationHooks();
  // Urutan penting: useChatSocket yang membuat koneksi, notifikasi menumpang.
  useChatSocket();
  useNotificationSocket();
  const { pathname } = useLocation();
  const token = sessionStorage.getItem("token");

  // Berpindah halaman ikut menyegarkan, jadi membuka lalu meninggalkan sebuah
  // percakapan langsung menurunkan angkanya tanpa menunggu interval berikutnya.
  useEffect(() => {
    if (!token) return;
    fetchUnreadTotal();
    fetchNotificationUnread();
  }, [pathname]);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      fetchUnreadTotal();
      fetchNotificationUnread();
    }, UNREAD_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Mobile: header, konten, navbar bawah bertumpuk, dan hanya baris
          konten yang menyerap sisa tinggi layar. Dulu tiap halaman menebak
          tingginya sendiri dengan angka vh, sehingga bagian bawahnya tertutup
          navbar. Desktop: satu baris, kolom navbar | konten | profil.

          100dvh, bukan 100vh: di Safari iOS 100vh ikut menghitung area di
          balik toolbar browser. 100vh tetap dipasang sebagai cadangan untuk
          browser yang belum mengenal dvh. */}
      <Grid
        templateColumns="repeat(10, 1fr)"
        templateRows={{ base: "auto minmax(0, 1fr) auto", md: "minmax(0, 1fr)" }}
        h="100vh"
        sx={{ "@supports (height: 100dvh)": { height: "100dvh" } }}
        overflow="hidden"
      >
        <GridItem
          zIndex="99"
          bg="#1D1D1D"
          colSpan={{ base: 10, md: 3, lg: 2 }}
        >
          <Navbar />
        </GridItem>

        <GridItem
          bg="#1D1D1D"
          borderColor="gray.400"
          borderLeft={{ base: "none", md: "2px" }}
          borderRight={{ base: "none", md: "2px" }}
          colSpan={{ base: 10, md: 7, lg: 5 }}
          pt={{ base: 0, md: 10 }}
          minH="0"
          overflow="hidden"
        >
          <Outlet />
        </GridItem>

        <GridItem
          colSpan={3}
          bg="#1D1D1D"
          minH="0"
          display={{ base: "none", lg: "block" }}
        >
          <SideProfile />
        </GridItem>

        <GridItem
          colSpan={10}
          bg="#262626"
          color="white"
          display={{ base: "block", md: "none" }}
        >
          <MobileNavbar />
        </GridItem>
      </Grid>
    </>
  );
}

export default MainLayout;
