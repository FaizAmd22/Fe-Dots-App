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
import { darkenOnHover } from "../features/HoverStyles";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "../i18n/useTranslation";

const UserCard = (data: any) => {
  const token = sessionStorage.getItem("token");
  const { fetchProfile } = useProfileHooks();
  const { fetchCurrentUser } = useSideProfileHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();
  const { pathname } = useLocation();
  const toast = useToast();
  const { t } = useTranslation();

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
        title: error.response?.data?.message || t("profile.followFailed"),
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

  // Kartu ini tampil di halaman Follows (latar biasa) dan di panel Suggestion
  // (surface hijau di mode terang). Di atas surface, warna sekunder dan aksen
  // hover harus berbeda: abu-abu dan hijau tidak terlihat di atas hijau.
  const onSurface = data.type == "suggestion";
  const mutedColor = onSurface ? "app.onSurfaceMuted" : "gray.500";
  const accentColor = onSurface ? "app.surfaceAccent" : "green.500";

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
            {...darkenOnHover}
          />
        </Link>
      </GridItem>

      <GridItem colSpan={6} my="auto" pl="2">
        <Flex flexDirection="column">
          <Link to={`/profile/${data.data.username}`} onClick={handleClick}>
            <Text
              fontSize={data.type == "suggestion" ? "sm" : "md"}
              {...darkenOnHover}
            >
              {data.data.name}
            </Text>
          </Link>

          <Link to={`/profile/${data.data.username}`} onClick={handleClick}>
            <Text
              color={mutedColor}
              fontSize={data.type == "suggestion" ? "sm" : "md"}
              {...darkenOnHover}
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
        // Belum di-follow: mewarisi warna teks induknya (terang di atas
        // surface, gelap/putih di halaman biasa).
        color={isFollow ? mutedColor : "inherit"}
        borderColor={isFollow ? mutedColor : "currentColor"}
        _hover={{ bg: "none", color: accentColor, borderColor: accentColor }}
        isDisabled={isPending}
        onClick={handleFollow}
      >
        {isFollow ? t("common.unfollow") : t("common.follow")}
      </Button>
      {/* </Flex> */}
    </Grid>
  );
};

export default UserCard;
