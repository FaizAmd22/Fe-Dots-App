/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Box, Button, Flex, IconButton, Spinner, Stack, Text } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import CreateMessage from "../../features/CreateMessage";
import { useChatHooks } from "../../hooks/chat";
import { IConversation, IMessage } from "../../interfaces/ChatInterface";
import {
  selectConversations,
  selectLastSeenById,
  selectMessages,
  selectOnlineUserIds,
} from "../../slices/chatSlice";
import PresenceLabel from "../../features/PresenceLabel";
import {
  conversationTitle,
  otherParticipant,
  readCursorFromReads,
} from "../../features/ChatHelpers";
import MessageBubble from "./components/MessageBubble";
import ForwardModal from "./components/ForwardModal";
import { useConversationRoom } from "../../hooks/chatSocket";
import { useDispatch } from "react-redux";
import {
  advanceReadCursor,
  appendMessage,
  closeRoom,
  markConversationRead,
  openRoom,
  removeMessagesByIds,
} from "../../slices/chatSlice";
import SelectionToolbar from "./components/SelectionToolbar";
import { darkenOnGroupHover } from "../../features/HoverStyles";
import { useTranslation } from "../../i18n/useTranslation";

const ChatRoom = () => {
  const { id } = useParams();
  const conversationId = String(id || "");
  const myId = Number(sessionStorage.getItem("id"));
  const { t } = useTranslation();

  const {
    fetchMessages,
    fetchOlderMessages,
    refreshLatestMessages,
    fetchConversations,
    markAsRead,
    deleteMessages,
  } = useChatHooks();
  const navigate = useNavigate();
  const messages = useSelector(selectMessages);
  const conversations = useSelector(selectConversations);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // ---- Infinite scroll ke atas ----
  const listRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  // Ref, bukan state: event scroll bisa berbunyi berkali-kali sebelum
  // render berikutnya, dan state belum sempat berubah di saat itu.
  const loadingOlderRef = useRef<boolean>(false);
  // Posisi sebelum halaman lama disisipkan, untuk dipulihkan sesudahnya.
  const restoreScrollRef = useRef<{ height: number; top: number } | null>(null);
  // Apakah user sedang berada di dekat pesan terbaru.
  const nearBottomRef = useRef<boolean>(true);
  const initialScrollDoneRef = useRef<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isForwardOpen, setIsForwardOpen] = useState<boolean>(false);
  const selectionMode = selectedIds.length > 0;

  const toggleSelect = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const clearSelection = () => setSelectedIds([]);

  // "Hapus untuk semua" hanya boleh kalau seluruh pesan terpilih milik kita.
  const allSelectedAreMine = selectedIds.every((id) => {
    const message = messages.find((item: IMessage) => item.id === id);
    return message?.sender?.id === myId;
  });

  const handleDelete = async (scope: "me" | "everyone") => {
    await deleteMessages(conversationId, selectedIds, scope);
    clearSelection();
    // Cuplikan dan badge ikut berubah kalau yang dihapus pesan terakhir.
    // fetchConversations sekaligus menghitung ulang badge-nya.
    fetchConversations();
  };

  const onlineUserIds = useSelector(selectOnlineUserIds);
  const lastSeenById = useSelector(selectLastSeenById);

  const conversation = conversations.find(
    (item: IConversation) => item.id === conversationId
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Hanya pesannya yang ditunggu. Sebelumnya ketiganya dijalankan
        // berderet, sehingga membuka percakapan menunggu tiga request.
        // Yang dimuat pun hanya satu halaman terbaru, bukan seluruh riwayat.
        const more = await fetchMessages(conversationId);
        setHasMore(more);
        setIsLoading(false);

        // Menandai terbaca tidak mempengaruhi isi layar, jadi tidak ditunggu.
        // Angka unread langsung dinolkan di sini; daftar percakapan tidak perlu
        // diambil ulang (dulu dua request tambahan setiap membuka percakapan).
        markAsRead(conversationId);
        dispatch(markConversationRead(conversationId));
      } catch (err: any) {
        setError(err.response?.data?.message || t("chat.loadFailed"));
        setIsLoading(false);
      }
    };

    // Keadaan gulir milik percakapan sebelumnya tidak boleh terbawa.
    setHasMore(false);
    initialScrollDoneRef.current = false;
    nearBottomRef.current = true;
    restoreScrollRef.current = null;

    if (!conversationId) return;

    // Sinkron, sebelum request apa pun: pesan dari percakapan sebelumnya
    // dibuang, dan respons yang telat dari sana diabaikan slice.
    dispatch(openRoom(conversationId));
    fetchData();
    clearSelection();

    return () => {
      dispatch(closeRoom(conversationId));
    };
  }, [conversationId]);

  const loadOlderMessages = async () => {
    if (loadingOlderRef.current || !hasMore) return;

    const oldest = messages.find((message: IMessage) => !message.pending);
    const container = listRef.current;
    if (!oldest || !container) return;

    loadingOlderRef.current = true;
    setIsLoadingOlder(true);
    restoreScrollRef.current = {
      height: container.scrollHeight,
      top: container.scrollTop,
    };

    try {
      const more = await fetchOlderMessages(conversationId, oldest.id);
      setHasMore(more);
    } catch (err) {
      restoreScrollRef.current = null;
    } finally {
      loadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  };

  const handleScroll = () => {
    const container = listRef.current;
    if (!container) return;

    nearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    // Mulai memuat sedikit sebelum benar-benar mentok di atas, supaya
    // pergantian halamannya tidak terasa.
    if (container.scrollTop < 120) loadOlderMessages();
  };

  // Setelah halaman lama disisipkan di atas, konten memanjang ke atas dan
  // tampilan akan melompat. Jarak dari bawah dipertahankan supaya pesan yang
  // sedang dibaca tetap di tempatnya. useLayoutEffect: sebelum browser melukis,
  // jadi lompatannya tidak sempat terlihat.
  useLayoutEffect(() => {
    const saved = restoreScrollRef.current;
    const container = listRef.current;
    if (!saved || !container) return;

    container.scrollTop = container.scrollHeight - saved.height + saved.top;
    restoreScrollRef.current = null;
  }, [messages]);

  // Pesan masuk, penghapusan, dan perubahan status baca datang lewat socket.
  //
  // Pesan baru disisipkan langsung dari payload, tanpa mengambil ulang daftar
  // pesan. Aman: pesan yang baru lahir belum mungkin dihapus "untuk saya", dan
  // centangnya diurus readCursor di slice.
  useConversationRoom(conversationId, {
    onMessage: (payload) => {
      // Tanpa isi pesan: setelah reconnect (bisa ada pesan terlewat) atau
      // hasil forward. Baru di sini halaman terbaru diambil ulang — digabung,
      // bukan diganti, supaya halaman lama dari infinite scroll tidak hilang.
      if (!payload?.message) {
        refreshLatestMessages(conversationId);
        markAsRead(conversationId);
        dispatch(markConversationRead(conversationId));
        return;
      }

      dispatch(appendMessage({ conversationId, message: payload.message }));

      // Pesan sendiri (dari tab lain) tidak perlu ditandai terbaca. Dulu ini
      // tetap dipanggil, dan event "chat:read" yang dihasilkannya membuat
      // lawan bicara ikut mengambil ulang seluruh pesan.
      if (payload.message.sender?.id !== myId) {
        markAsRead(conversationId);
        dispatch(markConversationRead(conversationId));
      }
    },
    onMessagesDeleted: (payload) => {
      dispatch(removeMessagesByIds(payload.messageIds || []));
    },
    // Lawan bicara membaca: centang berubah seketika dari payload.
    onRead: (payload) =>
      dispatch(
        advanceReadCursor({
          conversationId,
          cursor: readCursorFromReads(payload.reads, myId),
        })
      ),
  });

  // Bergantung pada id pesan TERAKHIR, bukan jumlah pesan: menyisipkan halaman
  // lama di atas menambah jumlah pesan, dan dulu itu melempar user kembali ke
  // bawah setiap kali selesai memuat riwayat.
  const lastMessage = messages.length ? messages[messages.length - 1] : null;

  useEffect(() => {
    if (isLoading || !lastMessage) return;

    if (!initialScrollDoneRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      initialScrollDoneRef.current = true;
      return;
    }

    // Pesan baru hanya menarik layar ke bawah kalau user memang sedang di
    // bawah, atau pesannya milik sendiri. Yang sedang membaca riwayat lama
    // tidak diganggu.
    if (nearBottomRef.current || lastMessage.sender?.id === myId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lastMessage?.id, isLoading]);

  const other = conversation ? otherParticipant(conversation, myId) : undefined;
  const title = conversation ? conversationTitle(conversation, myId, t) : "";

  // Grup tidak punya satu profil untuk dituju, jadi hanya DM yang bisa diklik.
  const canOpenProfile = Boolean(!conversation?.is_group && other?.username);

  const openProfile = () => {
    if (!other?.username) return;

    // Halaman profil membaca username dari sessionStorage, bukan dari URL
    // (lihat useProfileHooks). Tanpa baris ini yang terbuka adalah profil
    // orang yang terakhir dilihat, bukan lawan bicara ini.
    sessionStorage.setItem("profile", JSON.stringify(other));
    navigate(`/profile/${other.username}`);
  };

  return (
    <Stack h="100%" pl="4" pr={{base: 4, md: 0}} pb="2" color="app.text">
      {selectionMode ? (
        <SelectionToolbar
          count={selectedIds.length}
          canDeleteForEveryone={allSelectedAreMine}
          onCancel={clearSelection}
          onForward={() => setIsForwardOpen(true)}
          onDelete={handleDelete}
        />
      ) : (
      <Flex alignItems="center" gap="3" py={{ base: "2", md: "4" }}>
        <IconButton
          size="lg"
          bg="none"
          color="app.text"
          rounded="full"
          aria-label={t("common.back")}
          icon={<LuArrowLeft />}
          _hover={{ bg: "app.card" }}
          onClick={() => window.history.back()}
        />

        {conversation && (
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            gap={3}
            px="2"
            py="1"
            rounded="lg"
            role="group"
            cursor={canOpenProfile ? "pointer" : "default"}
            onClick={canOpenProfile ? openProfile : undefined}
          >
            <Avatar
              w="35px"
              h="35px"
              name={title}
              src={conversation.is_group ? undefined : other?.picture}
              {...(canOpenProfile ? darkenOnGroupHover : {})}
            />

            <Box>
              <Text
                fontSize="md"
                fontWeight="semibold"
                {...(canOpenProfile ? darkenOnGroupHover : {})}
              >
                {title}
              </Text>

              {conversation.is_group ? (
                <Text fontSize="xs" color="gray.500">
                  {t("chat.members", { count: conversation.participants.length })}
                </Text>
              ) : (
                <PresenceLabel
                  isOnline={
                    other ? onlineUserIds.includes(other.id) : false
                  }
                  // Nilai dari socket lebih baru daripada yang ikut di data awal.
                  lastSeenAt={
                    (other && lastSeenById[other.id]) ||
                    other?.last_seen_at ||
                    null
                  }
                />
              )}
            </Box>
          </Flex>
        )}
      </Flex>
      )}

      <ForwardModal
        isOpen={isForwardOpen}
        onClose={() => setIsForwardOpen(false)}
        messageIds={selectedIds}
        onForwarded={clearSelection}
      />

      <Box
        ref={listRef}
        onScroll={handleScroll}
        flex="1"
        minH="0"
        paddingRight={1}
        overflowY="auto"
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
        {error ? (
          <Text color="red.500" textAlign="center" pt="20">
            {error}
          </Text>
        ) : isLoading ? (
          <Text color="gray.500" textAlign="center" pt="20">
            {t("chat.loadingMessages")}
          </Text>
        ) : messages.length ? (
          <>
            {/* Indikator di puncak daftar. Tombolnya juga jalan keluar kalau
                pesannya terlalu sedikit untuk bisa digulir. */}
            {isLoadingOlder ? (
              <Flex justifyContent="center" py="2">
                <Spinner size="sm" color="green.500" />
              </Flex>
            ) : hasMore ? (
              <Flex justifyContent="center" py="2">
                <Button
                  size="xs"
                  bg="none"
                  color="app.textMuted"
                  _hover={{ color: "app.text", bg: "app.card" }}
                  onClick={loadOlderMessages}
                >
                  {t("chat.loadOlder")}
                </Button>
              </Flex>
            ) : null}

            {messages.map((message: IMessage) => (
              <MessageBubble
                key={message.id}
                message={message}
                isGroup={conversation?.is_group || false}
                isSelected={selectedIds.includes(message.id)}
                selectionMode={selectionMode}
                onToggleSelect={toggleSelect}
              />
            ))}
            <div ref={bottomRef} />
          </>
        ) : (
          <Text color="gray.500" textAlign="center" pt="20">
            {t("chat.emptyRoom")}
          </Text>
        )}
      </Box>

      {!error && <CreateMessage conversationId={conversationId} />}
    </Stack>
  );
};

export default ChatRoom;
