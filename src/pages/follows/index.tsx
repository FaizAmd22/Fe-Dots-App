/* eslint-disable react-hooks/exhaustive-deps */
import { Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import FollowsTabs, { FollowsTab } from "../../component/FollowsTabs";
import { selectFollower, selectFollowing } from "../../slices/followSlice";
import { useFollowHooks } from "../../hooks/follow";
import { useTranslation } from "../../i18n/useTranslation";

// Menu Follows: daftar followers/following milik user yang login. Tab aktif
// dibaca dari ?tab=, supaya angka Followers/Following di profil sendiri bisa
// langsung membuka tab yang sesuai.
const Follows = () => {
  const { t } = useTranslation();
  const { fetchFollow } = useFollowHooks();
  const follower = useSelector(selectFollower);
  const following = useSelector(selectFollowing);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const tab: FollowsTab = searchParams.get("tab") === "following" ? "following" : "followers";

  useEffect(() => {
    const load = async () => {
      try {
        await fetchFollow();
      } catch (error) {
        console.error("Error fetching follows:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Stack h="100%" color="app.text" py={{ base: "0", md: "4" }} px="4">
      <Text fontSize="2xl" pt={{ base: "0", md: "4" }} fontWeight="semibold">
        {t("follows.title")}
      </Text>

      <FollowsTabs
        tab={tab}
        // replace: berpindah tab tidak menumpuk riwayat tombol back.
        onTabChange={(next) => setSearchParams({ tab: next }, { replace: true })}
        followers={follower}
        following={following}
        isLoading={isLoading}
      />
    </Stack>
  );
};

export default Follows;
