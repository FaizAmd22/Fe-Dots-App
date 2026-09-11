/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Text,
  List,
  ListItem,
  Button,
  Flex,
  Center,
  Stack,
  Spacer,
  Link,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Box,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { CiLogout } from "react-icons/ci";
import { LuLogOut } from "react-icons/lu";
import { LuBell, LuSettings } from "react-icons/lu";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { FALLBACK_AVATAR } from "../../features/ChatHelpers";
import { buildMenuItems } from "./menuItems";
import UnreadBadge from "./UnreadBadge";
import { darkenOnHover, navIconStyle, navLabelStyle } from "../../features/HoverStyles";
import CreatePostModal from "../../features/CreatePostModal";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../slices/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API } from "../../libs/axios";
import { disconnectSocket } from "../../libs/socket";
import { useThreadsHooks } from "../../hooks/threads";
import { useProfileHooks } from "../../hooks/profile";
import { useDetailThreadHooks } from "../../hooks/detailThread";
import { useProfileThreadHooks } from "../../hooks/profileThread";
import BrandLogo from "../BrandLogo";
import { useConfirm } from "../feedback/useConfirm";
import { useLoginPrompt } from "../feedback/useLoginPrompt";
import { useTranslation } from "../../i18n/useTranslation";

const Navbar = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const promptLogin = useLoginPrompt();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const { pathname } = useLocation();
  // Mengikuti URL, bukan menu terakhir yang diklik. Dulu state awalnya "Home"
  // (bukan path), jadi saat halaman dibuka tidak ada menu yang tampil aktif.
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);
  const { fetchThread } = useThreadsHooks();
  const { fetchProfile } = useProfileHooks();
  const { fetchDetail } = useDetailThreadHooks();
  const { fetchProfileThread } = useProfileThreadHooks();

  const ListNavbar = buildMenuItems(user.username);

  const handleClick = (name: string, path: string) => {
    if (!token) {
      if (name == "Home") {
        navigate(path);
      } else {
        promptLogin();
      }
    } else {
      navigate(path);
      sessionStorage.setItem("profile", JSON.stringify(user));
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    // Konfirmasi dulu: logout gampang tertekan tidak sengaja, apalagi tombolnya
    // bersebelahan dengan menu lain.
    const confirmed = await confirm({
      title: t("auth.logoutTitle"),
      description: t("auth.logoutText"),
      confirmText: t("auth.logoutConfirm"),
      tone: "danger",
      icon: <LuLogOut />,
    });

    if (!confirmed) return;

    setIsLoggingOut(true);

    // Logout tetap jalan walau request ini gagal (misalnya server sedang
    // tidur): yang benar-benar mengeluarkan user adalah penghapusan token di
    // bawah. Dulu kegagalannya menghentikan seluruh proses logout.
    try {
      await API.delete("/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("id");
    // Koneksi socket memakai token lama, jadi harus diputus saat logout.
    disconnectSocket();
    delete axios.defaults.headers.common["Authorization"];
    fetchThread();
    fetchDetail();
    fetchProfile();
    fetchProfileThread();
    // Tanpa popup "berhasil keluar": halaman langsung kembali ke beranda
    // dalam keadaan belum login, dan itu sudah cukup jelas.
    window.location.assign("/");
  };

  return (
    // Di mobile komponen ini hanya menjadi header (logo + menu akun), dan
    // tingginya mengikuti isi. Dulu 1vh: headernya meluber menimpa konten dan
    // halaman harus diganjal padding supaya tidak tertutup.
    <Stack
      h={{ base: "auto", md: "100%" }}
      pt="1"
      px={{ base: "0", md: "10" }}
      pb={{ base: "0", md: "7" }}
    >
      <Stack>
        <Text
          px="3"
          pt={{ base: "0", md: "2" }}
          color="green.500"
          fontWeight="semibold"
        >
          <Flex alignItems="center">
            <Stack py={{ base: 2, md: 5 }}>
              <BrandLogo
                responsive
                h={{ base: "36px", md: "40px", lg: "48px" }}
              />
            </Stack>

            <Spacer />

            {!token ? (
              <Link
                onClick={() => navigate("/login")}
                px="5"
                py="1"
                bg="none"
                fontSize="sm"
                margin="auto"
                rounded="full"
                border="2px"
                borderColor="green.500"
                color="green.500"
                display={{ base: "block", md: "none" }}
                _hover={{
                  color: "green.500",
                  bg: "app.inverse",
                  borderColor: "app.inverse",
                }}
              >
                {t("auth.login")}
              </Link>
            ) : (
              // Navbar bawah mobile hanya memuat 4 menu utama (Home, Search,
              // Chat, Follows). Notifikasi tampil sebagai lonceng di sini,
              // sedangkan Profile, Settings, dan Logout ada di menu avatar.
              <HStack spacing="3" display={{ base: "flex", md: "none" }}>
                <Box position="relative">
                  <IconButton
                    variant="ghost"
                    rounded="full"
                    fontSize="22px"
                    aria-label={t("nav.notifications")}
                    icon={<LuBell />}
                    _hover={{ bg: "app.hover" }}
                    {...navIconStyle(isActive("/notifications"), "app.textSoft")}
                    onClick={() => handleClick("Notifications", "/notifications")}
                  />
                  <UnreadBadge floating kind="notification" />
                </Box>

              <Menu placement="bottom-end" autoSelect={false}>
                <MenuButton
                  display={{ base: "block", md: "none" }}
                  rounded="full"
                  aria-label={t("nav.accountMenu")}
                  {...darkenOnHover}
                >
                  <Avatar
                    w="36px"
                    h="36px"
                    name={user.name}
                    src={user.picture || FALLBACK_AVATAR}
                  />
                </MenuButton>

                <MenuList
                  bg="app.card"
                  borderColor="app.borderSoft"
                  color="app.text"
                  fontWeight="normal"
                  minW="48"
                  py="1"
                  zIndex="popover"
                >
                  <MenuItem
                    bg="transparent"
                    _hover={{ bg: "app.hover" }}
                    _focus={{ bg: "app.hover" }}
                    icon={<HiOutlineUserCircle size="18px" />}
                    onClick={() =>
                      handleClick("Profile", `/profile/${user.username}`)
                    }
                  >
                    {t("nav.profile")}
                  </MenuItem>

                  <MenuItem
                    bg="transparent"
                    _hover={{ bg: "app.hover" }}
                    _focus={{ bg: "app.hover" }}
                    icon={<LuSettings size="18px" />}
                    onClick={() => handleClick("Settings", "/settings")}
                  >
                    {t("nav.settings")}
                  </MenuItem>

                  <MenuDivider borderColor="app.borderSoft" />

                  <MenuItem
                    bg="transparent"
                    color="red.400"
                    _hover={{ bg: "app.hover" }}
                    _focus={{ bg: "app.hover" }}
                    icon={<CiLogout size="18px" />}
                    onClick={() => handleLogout()}
                  >
                    {t("auth.logout")}
                  </MenuItem>
                </MenuList>
              </Menu>
              </HStack>
            )}
          </Flex>
        </Text>

        <List
          mt="3"
          pb="3"
          px="3"
          spacing={2.5}
          color="app.textSoft"
          display={{ base: "none", md: "block" }}
        >
          {ListNavbar.map((data, index) => {
            return (
              <ListItem w="100%" key={index}>
                <Link
                  onClick={() => handleClick(data.name, data.path)}
                  _hover={{ textDecoration: "none" }}
                >
                  {/* role="group" sengaja di Flex, bukan di ListItem: Chakra
                      bisa menimpa atribut role pada komponen list-nya. */}
                  <Flex
                    role="group"
                    px="2"
                    py="2"
                    rounded="lg"
                    cursor="pointer"
                  >
                    <Center>
                      <Text
                        fontSize={{ base: "xl", lg: "2xl" }}
                        mr="2"
                        {...navIconStyle(isActive(data.path))}
                      >
                        {data.icon}
                      </Text>

                      <Text fontSize="md" {...navLabelStyle(isActive(data.path))}>
                        {t(data.labelKey)}
                      </Text>

                      {data.badge && <UnreadBadge kind={data.badge} />}
                    </Center>
                  </Flex>
                </Link>
              </ListItem>
            );
          })}
        </List>

        {/* Wadahnya ikut disembunyikan di mobile: tombolnya sendiri sudah
            tersembunyi, tapi padding wadah ini tetap menyisakan celah kosong
            di bawah header. */}
        {token && (
          <Stack paddingTop={6} display={{ base: "none", md: "flex" }}>
            <CreatePostModal />
          </Stack>
        )}
      </Stack>

      <Spacer />

      {!token ? (
        <Link
          onClick={() => navigate("/login")}
          w="100%"
          py="2"
          bg="none"
          color="green.500"
          fontSize="md"
          border="2px"
          rounded="full"
          fontWeight="semibold"
          display={{ base: "none", md: "block" }}
          _hover={{ color: "green.500", borderColor: "app.inverse", bg: "app.inverse" }}
        >
          <Center gap="3">{t("auth.login")}</Center>
        </Link>
      ) : (
        <Button
          bg="none"
          color="app.textMuted"
          _hover={{ color: "app.text", bg: "none" }}
          display={{ base: "none", md: "block" }}
          isLoading={isLoggingOut}
          onClick={() => handleLogout()}
        >
          <Center gap="3">
            <CiLogout fontSize="25px" />
            <Text fontSize={{ base: "sm", lg: "md" }}>{t("auth.logout")}</Text>
          </Center>
        </Button>
      )}
      
    </Stack>
  );
};

export default Navbar;
