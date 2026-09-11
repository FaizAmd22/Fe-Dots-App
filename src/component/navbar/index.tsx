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
} from "@chakra-ui/react";
import { CiLogout } from "react-icons/ci";
import { LuHeart } from "react-icons/lu";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { FALLBACK_AVATAR } from "../../features/ChatHelpers";
import { buildMenuItems } from "./menuItems";
import UnreadBadge from "./UnreadBadge";
import { darkenOnHover, navTextOnGroupHover } from "../../features/HoverStyles";
import CreatePostModal from "../../features/CreatePostModal";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { selectUser } from "../../slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API } from "../../libs/axios";
import { disconnectSocket } from "../../libs/socket";
import { useThreadsHooks } from "../../hooks/threads";
import { useProfileHooks } from "../../hooks/profile";
import { useDetailThreadHooks } from "../../hooks/detailThread";
import { useProfileThreadHooks } from "../../hooks/profileThread";
import BrandLogo from "../BrandLogo";

const Navbar = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [selected, setSelected] = useState<string>("Home");
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
        Swal.fire({
          title: "You need to login first!",
          text: "Do you wanna login?",
          background: "#2b2b2b",
          color: "white",
          showCancelButton: true,
          confirmButtonText: "Yes",
          reverseButtons: true,
        }).then((result: any) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
      }
    } else {
      navigate(path);
      setSelected(path);
      sessionStorage.setItem("profile", JSON.stringify(user));
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    // Konfirmasi dulu: logout gampang tertekan tidak sengaja, apalagi tombolnya
    // bersebelahan dengan menu lain.
    const confirmation = await Swal.fire({
      title: "Logout?",
      text: "You'll need to login again to access your account.",
      icon: "warning",
      background: "#2b2b2b",
      color: "white",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

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
    // navigate("/")
    // alert("Logout Success!")
    Swal.fire({
      title: "Logout Success!",
      icon: "success",
      background: "#2b2b2b",
      color: "white",
      confirmButtonText: "Okey",
    }).then(() => window.location.assign("/"));
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
                  bg: "white",
                  borderColor: "white",
                }}
              >
                Login
              </Link>
            ) : (
              // Navbar bawah mobile hanya memuat 4 menu utama; Profile,
              // Follows, dan Logout pindah ke sini.
              <Menu placement="bottom-end" autoSelect={false}>
                <MenuButton
                  display={{ base: "block", md: "none" }}
                  rounded="full"
                  aria-label="Menu akun"
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
                  bg="#262626"
                  borderColor="whiteAlpha.300"
                  color="white"
                  fontWeight="normal"
                  minW="48"
                  py="1"
                  zIndex="popover"
                >
                  <MenuItem
                    bg="transparent"
                    _hover={{ bg: "whiteAlpha.200" }}
                    _focus={{ bg: "whiteAlpha.200" }}
                    icon={<HiOutlineUserCircle size="18px" />}
                    onClick={() =>
                      handleClick("Profile", `/profile/${user.username}`)
                    }
                  >
                    Profile
                  </MenuItem>

                  <MenuItem
                    bg="transparent"
                    _hover={{ bg: "whiteAlpha.200" }}
                    _focus={{ bg: "whiteAlpha.200" }}
                    icon={<LuHeart size="18px" />}
                    onClick={() => handleClick("Follows", "/follows")}
                  >
                    Follows
                  </MenuItem>

                  <MenuDivider borderColor="whiteAlpha.300" />

                  <MenuItem
                    bg="transparent"
                    color="red.400"
                    _hover={{ bg: "whiteAlpha.200" }}
                    _focus={{ bg: "whiteAlpha.200" }}
                    icon={<CiLogout size="18px" />}
                    onClick={() => handleLogout()}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Text>

        <List
          mt="3"
          pb="3"
          px="3"
          spacing={2.5}
          color="gray.300"
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
                        color={data.path == selected ? "white" : "gray.300"}
                        fontSize={{ base: "xl", lg: "2xl" }}
                        mr="2"
                        {...navTextOnGroupHover}
                      >
                        {data.icon}
                      </Text>

                      <Text
                        color={data.path == selected ? "white" : "gray.300"}
                        fontWeight={
                          data.path == selected ? "semibold" : "normal"
                        }
                        fontSize="md"
                        {...navTextOnGroupHover}
                      >
                        {data.name}
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
          _hover={{ color: "green.500", borderColor: "white", bg: "white" }}
        >
          <Center gap="3">Login</Center>
        </Link>
      ) : (
        <Button
          bg="none"
          color="gray.400"
          _hover={{ color: "white", bg: "none" }}
          display={{ base: "none", md: "block" }}
          isLoading={isLoggingOut}
          onClick={() => handleLogout()}
        >
          <Center gap="3">
            <CiLogout fontSize="25px" />
            <Text fontSize={{ base: "sm", lg: "md" }}>Logout</Text>
          </Center>
        </Button>
      )}
      
    </Stack>
  );
};

export default Navbar;
