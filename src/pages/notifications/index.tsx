/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Center, Spinner, Stack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { LoadingConversationCard } from "../../component/LoadingCard";
import { useNotificationHooks } from "../../hooks/notification";
import { connectSocket } from "../../libs/socket";
import { selectNotifications } from "../../slices/notificationSlice";
import NotificationCard from "./components/NotificationCard";

// Jarak ke dasar daftar (px) saat halaman berikutnya mulai dimuat.
const LOAD_MORE_THRESHOLD = 200;

const Notifications = () => {
  const { fetchNotifications, fetchMoreNotifications, markNotificationsRead } =
    useNotificationHooks();
  const notifications = useSelector(selectNotifications);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  // Ref, bukan state: event scroll datang beruntun sebelum state sempat
  // diperbarui, dan tanpa ini halaman yang sama bisa diminta berkali-kali.
  const loadingMoreRef = useRef<boolean>(false);
  const loopingLoading = [1, 2, 3, 4, 5, 6, 7, 8];

  // Halaman pertama, lalu semuanya ditandai terbaca. Status baca di daftar
  // sengaja tidak diubah, supaya yang baru tetap tersorot selama kunjungan ini.
  const loadFirstPage = async () => {
    try {
      setHasMore(await fetchNotifications());
      setLoadError(false);
      markNotificationsRead();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFirstPage();
  }, []);

  // Notifikasi yang masuk selagi halaman ini terbuka langsung tampil dan ikut
  // terbaca. connectSocket, bukan getSocket: effect halaman ini berjalan
  // SEBELUM effect MainLayout yang membuat koneksinya.
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const socket = connectSocket(token);
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const onChanged = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(loadFirstPage, 300);
    };

    socket.on("notification:changed", onChanged);
    return () => {
      socket.off("notification:changed", onChanged);
      clearTimeout(refreshTimer);
    };
  }, []);

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore || !notifications.length) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      setHasMore(
        await fetchMoreNotifications(notifications[notifications.length - 1].id)
      );
    } catch (error) {
      console.error("Error fetching more notifications:", error);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    if (list.scrollHeight - list.scrollTop - list.clientHeight < LOAD_MORE_THRESHOLD) {
      loadMore();
    }
  };

  return (
    <Stack h="100%" px="4" pb="0" color="app.text">
      <Text fontSize="2xl" fontWeight="semibold" py={{ base: "0", md: "4" }}>
        Notifikasi
      </Text>

      <Box
        flex="1"
        minH="0"
        overflowY="auto"
        onScroll={handleScroll}
        sx={{
          "&::-webkit-scrollbar": {
            width: "6px",
            backgroundColor: `none`,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: `green.500`,
            borderRadius: "3px",
          },
        }}
      >
        {isLoading ? (
          <Stack gap="6" pt="4">
            {loopingLoading.map((_, index: number) => (
              <LoadingConversationCard key={index} />
            ))}
          </Stack>
        ) : loadError && !notifications.length ? (
          <Stack alignItems="center" pt="20" gap="3">
            <Text color="gray.500">Gagal memuat notifikasi.</Text>
            <Button
              size="sm"
              rounded="full"
              colorScheme="green"
              onClick={() => {
                setIsLoading(true);
                loadFirstPage();
              }}
            >
              Coba lagi
            </Button>
          </Stack>
        ) : notifications.length ? (
          <>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}

            {/* Tombol ini juga menjadi jalan keluar kalau halaman pertama
                terlalu pendek untuk digulir, sehingga onScroll tidak pernah terpicu. */}
            {hasMore && (
              <Center py="4">
                {isLoadingMore ? (
                  <Spinner color="green.500" />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="app.textMuted"
                    _hover={{ color: "app.text", bg: "app.hover" }}
                    onClick={loadMore}
                  >
                    Muat lebih banyak
                  </Button>
                )}
              </Center>
            )}
          </>
        ) : (
          <Text color="gray.500" textAlign="center" pt="20" px="6">
            Belum ada notifikasi. Follow, like, dan balasan dari orang lain akan
            muncul di sini.
          </Text>
        )}
      </Box>
    </Stack>
  );
};

export default Notifications;
