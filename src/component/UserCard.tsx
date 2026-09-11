/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { API } from "../libs/axios";
import { useSideProfileHooks } from "../hooks/sideProfile";
import { useProfileHooks } from "../hooks/profile";
import { useProfileThreadHooks } from "../hooks/profileThread";
import { Link, useLocation } from "react-router-dom";
import { darkenOnHover } from "../features/HoverStyles";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "../i18n/useTranslation";
import { useLoginPrompt } from "./feedback/useLoginPrompt";

const UserCard = (data: any) => {
  const token = sessionStorage.getItem("token");
  const { fetchProfile } = useProfileHooks();
  const { fetchCurrentUser } = useSideProfileHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();
  const { pathname } = useLocation();
  const toast = useToast();
  const { t } = useTranslation();
  const promptLogin = useLoginPrompt();
  // Di daftar followers orang lain, kita sendiri bisa ikut tercantum; tombol
  // Follow untuk diri sendiri tidak bermakna (dan ditolak server).
  const isSelf = data.data.id === Number(sessionStorage.getItem("id"));

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
    // Tamu bisa melihat daftar followers orang lain; follow butuh akun.
    if (!token) {
      promptLogin();
      return;
    }
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

  const isSuggestion = data.type == "suggestion";
  const profilePath = `/profile/${data.data.username}`;
  const avatarSize = isSuggestion ? "45px" : { base: "48px", md: "56px" };

  return (
    // Flex, bukan grid 11 kolom: di HP satu kolom grid cuma ~30px sementara
    // avatarnya 60px, jadi avatar terpotong dan kartu meluber ke samping
    // (daftar Follows bisa digeser horizontal). Sekarang hanya kolom nama yang
    // menyempit, dan teks panjang dipotong dengan "…".
    <Flex alignItems="center" gap="3" w="100%" minW="0">
      <Link to={profilePath} onClick={handleClick} style={{ flexShrink: 0 }}>
        <Avatar
          src={
            data.data.picture
              ? data.data.picture
              : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
          }
          name={data.data.name}
          w={avatarSize}
          h={avatarSize}
          {...darkenOnHover}
        />
      </Link>

      <Box flex="1" minW="0">
        <Link to={profilePath} onClick={handleClick} style={{ display: "block" }}>
          <Text
            fontSize={isSuggestion ? "sm" : "md"}
            fontWeight="medium"
            noOfLines={1}
            {...darkenOnHover}
          >
            {data.data.name}
          </Text>
        </Link>

        <Link to={profilePath} onClick={handleClick} style={{ display: "block" }}>
          <Text color={mutedColor} fontSize="sm" noOfLines={1} {...darkenOnHover}>
            @{data.data.username}
          </Text>
        </Link>
      </Box>

      {!isSelf && (
        <Button
          flexShrink={0}
          size="sm"
          h={isSuggestion ? "32px" : "36px"}
          px={isSuggestion ? "4" : { base: "4", md: "6" }}
          minW={isSuggestion ? undefined : { base: "96px", md: "120px" }}
          bg="none"
          border="2px"
          fontSize={isSuggestion ? "xs" : "sm"}
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
      )}
    </Flex>
  );
};

export default UserCard;
