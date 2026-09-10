/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, GridItem } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useChatHooks } from "../hooks/chat";
import { useChatSocket } from "../hooks/chatSocket";
import MobileNavbar from "../component/navbar/components/MobileNavbar";
import Navbar from "../component/navbar/index";
import SideProfile from "../component/sideProfile/index";

// Pembaruan utama datang dari socket. Interval ini tinggal jaring pengaman
// kalau koneksi socket sedang putus, jadi jaraknya dilonggarkan.
const UNREAD_REFRESH_MS = 120000;

function MainLayout() {
  const { fetchUnreadTotal } = useChatHooks();
  useChatSocket();
  const { pathname } = useLocation();
  const token = sessionStorage.getItem("token");

  // Berpindah halaman ikut menyegarkan, jadi membuka lalu meninggalkan sebuah
  // percakapan langsung menurunkan angkanya tanpa menunggu interval berikutnya.
  useEffect(() => {
    if (token) fetchUnreadTotal();
  }, [pathname]);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(fetchUnreadTotal, UNREAD_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Grid templateColumns="repeat(10, 1fr)" h="100vh" overflow='hidden'>
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
        >
          <Outlet />
        </GridItem>

        <GridItem
          colSpan={3}
          bg="#1D1D1D"
          display={{ base: "none", lg: "block" }}
        >
          <SideProfile />
        </GridItem>

        <GridItem
          colSpan={10}
          h="5vh"
          bg="black"
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
