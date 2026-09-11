/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import FollowsTabs, { FollowsTab } from "../../component/FollowsTabs";
import { useFollowHooks } from "../../hooks/follow";
import { IUsers } from "../../interfaces/UsersInterface";
import { selectUser } from "../../slices/userSlice";
import { useTranslation } from "../../i18n/useTranslation";

type FollowsData = {
  user: { name: string; username: string } | null;
  follower: IUsers[];
  following: IUsers[];
};

// Followers/following milik user lain: /profile/:username/followers atau
// /profile/:username/following. Tab aktif ikut URL, jadi bisa dibagikan dan
// tombol back browser tetap masuk akal.
const UserFollows = () => {
  const { username = "" } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchUserFollows } = useFollowHooks();
  const currentUser = useSelector(selectUser);

  const tab: FollowsTab = pathname.endsWith("/following") ? "following" : "followers";

  const [data, setData] = useState<FollowsData>({ user: null, follower: [], following: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    // Respons dari username sebelumnya yang telat datang tidak boleh
    // menimpa daftar milik username yang sekarang dibuka.
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    fetchUserFollows(username)
      .then((result) => isCurrent && setData(result))
      .catch((err: any) => isCurrent && setError(err.response?.data?.message || t("follows.loadFailed")))
      .finally(() => isCurrent && setIsLoading(false));

    return () => {
      isCurrent = false;
    };
  }, [username]);

  // Daftar milik sendiri ditangani menu Follows, dengan tab yang sama.
  if (currentUser?.username && currentUser.username === username) {
    return <Navigate to={`/follows?tab=${tab}`} replace />;
  }

  return (
    <Stack h="100%" color="app.text" py={{ base: "0", md: "4" }} px="4">
      <Flex alignItems="center" gap="2" pt={{ base: "0", md: "2" }}>
        <IconButton
          variant="ghost"
          rounded="full"
          color="app.text"
          aria-label={t("common.back")}
          icon={<LuArrowLeft />}
          _hover={{ bg: "app.hover" }}
          onClick={() => navigate(`/profile/${username}`)}
        />
        <Box minW="0">
          <Text fontSize="xl" fontWeight="semibold" lineHeight="short" noOfLines={1}>
            {data.user?.name || username}
          </Text>
          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            @{username}
          </Text>
        </Box>
      </Flex>

      {error ? (
        <Text color="red.400" textAlign="center" pt="16">
          {error}
        </Text>
      ) : (
        <FollowsTabs
          tab={tab}
          onTabChange={(next) => navigate(`/profile/${username}/${next}`, { replace: true })}
          followers={data.follower}
          following={data.following}
          isLoading={isLoading}
        />
      )}
    </Stack>
  );
};

export default UserFollows;
