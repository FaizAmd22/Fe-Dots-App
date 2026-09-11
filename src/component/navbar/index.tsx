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
} from "@chakra-ui/react";
import { CiLogout } from "react-icons/ci";
import { buildMenuItems } from "./menuItems";
import UnreadBadge from "./UnreadBadge";
import { navTextOnGroupHover } from "../../features/HoverStyles";
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
    <Stack
      h={{ base: "1vh", md: "100%" }}
      pt="1"
      px={{ base: "0", md: "10" }}
      pb="7"
    >
      <Stack>
        <Text
          px="3"
          pt="2"
          color="green.500"
          fontWeight="semibold"
          display={{ base: "none", xs: "block" }}
        >
          <Flex>
            <Stack py={5}>
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
              <Link
                px="5"
                py="1"
                bg="none"
                margin="auto"
                fontSize="sm"
                rounded="full"
                color="white"
                border="2px"
                borderColor="white"
                display={{ base: "block", md: "none" }}
                _hover={{
                  color: "white",
                  bg: "green.500",
                  borderColor: "green.500",
                }}
                onClick={() => handleLogout()}
              >
                Logout
              </Link>
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

        {token && (
          <Stack paddingTop={6}>
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
