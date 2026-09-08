/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Spacer,
  Button,
  Flex,
  Grid,
  GridItem,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { API } from "../libs/axios";
import { useSideProfileHooks } from "../hooks/sideProfile";
import { useProfileHooks } from "../hooks/profile";
import { useProfileThreadHooks } from "../hooks/profileThread";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

const UserCard = (data: any) => {
  const token = sessionStorage.getItem("token");
  const { fetchProfile } = useProfileHooks();
  const { fetchCurrentUser } = useSideProfileHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();
  const { pathname } = useLocation();
  const toast = useToast();

  // Status tombol dipegang lokal supaya bisa berubah seketika saat diklik,
  // tanpa menunggu request ke server selesai.
  const [isFollow, setIsFollow] = useState<boolean>(data.data.isFollow);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Ikuti nilai dari server saat daftarnya dimuat ulang, misalnya ketika
  // halaman dibuka lagi atau user berpindah halaman.
  useEffect(() => {
    setIsFollow(data.data.isFollow);
  }, [data.data.isFollow]);

  const handleClick = async () => {
    fetchProfile();
    fetchProfileThreadAuth();
    sessionStorage.setItem("profile", JSON.stringify(data.data));
  };

  const handleFollow = async () => {
    if (isPending) return;

    const nextIsFollow = !isFollow;
    setIsFollow(nextIsFollow);
    setIsPending(true);

    try {
      await API.post(
        nextIsFollow ? "/follow" : "/unfollow",
        { following: data.data.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      // Gagal di server, kembalikan tombol ke keadaan semula.
      setIsFollow(!nextIsFollow);
      setIsPending(false);
      toast({
        position: "top",
        title: error.response?.data?.message || "Gagal memperbarui follow!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsPending(false);

    // Sengaja TIDAK me-refetch daftar yang memuat kartu ini (suggestion dan
    // follows). Kalau di-refetch, user yang baru di-follow langsung hilang dari
    // daftar dan sisanya bergeser naik. Biarkan daftarnya utuh sampai user
    // memuat ulang halamannya sendiri.
    fetchCurrentUser();
    if (pathname.startsWith("/profile")) fetchProfile();
  };

  return (
    <Grid templateColumns="repeat(11, 1fr)">
      {/* <Flex> */}
      <GridItem display="flex" alignItems="center">
        <Link to={`/profile/${data.data.username}`} onClick={handleClick}>
          <Avatar
            src={
              data.data.picture
                ? data.data.picture
                : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
            }
            // alt={data.data.name}
            w={data.type == "suggestion" ? "45px" : "60px"}
            h={data.type == "suggestion" ? "45px" : "60px"}
          />
        </Link>
      </GridItem>

      <GridItem colSpan={6} my="auto" pl="2">
        <Flex flexDirection="column">
          <Link to={`/profile/${data.data.username}`} onClick={handleClick}>
            <Text fontSize={data.type == "suggestion" ? "sm" : "md"}>
              {data.data.name}
            </Text>
          </Link>

          <Link to={`/profile/${data.data.username}`} onClick={handleClick}>
            <Text
              color="gray.500"
              fontSize={data.type == "suggestion" ? "sm" : "md"}
              _hover={{ color: "white" }}
            >
              @{data.data.username}
            </Text>
          </Link>
        </Flex>
      </GridItem>

      <Spacer />

      <Button
        position="relative"
        px={data.type == "suggestion" ? "6" : "10"}
        bg="none"
        right="0"
        border="2px"
        fontSize={data.type == "suggestion" ? "xs" : "sm"}
        margin="auto"
        rounded="full"
        color={isFollow ? "gray.500" : "white"}
        borderColor={isFollow ? "gray.500" : "white"}
        _hover={{ bg: "none", color: "green.500", borderColor: "green.500" }}
        isDisabled={isPending}
        onClick={handleFollow}
      >
        {isFollow ? "Unfollow" : "Follow"}
      </Button>
      {/* </Flex> */}
    </Grid>
  );
};

export default UserCard;
