import { Box, Checkbox, Flex, Text, useDisclosure } from "@chakra-ui/react";
import ImageViewer from "../../../features/ImageViewer";
import ImageGrid from "../../../features/ImageGrid";
import { useState } from "react";
import { LuCheck, LuCheckCheck, LuClock, LuForward } from "react-icons/lu";
import { IMessage } from "../../../interfaces/ChatInterface";
import { useTranslation } from "../../../i18n/useTranslation";

// Di chat, jam lebih berguna daripada durasi relatif ala ChangeFormatDate
// yang dipakai thread — "just a few seconds" di tiap gelembung tidak membantu.
const clock = (date: string, locale: string) =>
  new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

const MessageBubble = ({
  message,
  isGroup,
  isSelected,
  selectionMode,
  onToggleSelect,
}: {
  message: IMessage;
  isGroup: boolean;
  isSelected: boolean;
  selectionMode: boolean;
  onToggleSelect: (id: string) => void;
}) => {
  const myId = Number(sessionStorage.getItem("id"));
  const isMine = message.sender?.id === myId;
  const { t, locale } = useTranslation();

  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();
  const [startIndex, setStartIndex] = useState<number>(0);

  const images = message.images?.length
    ? message.images
    : message.image
    ? [message.image]
    : [];

  const openAt = (index: number) => {
    setStartIndex(index);
    onImageOpen();
  };

  // Pesan yang belum sampai server belum punya id asli, jadi belum bisa dipilih.
  const selectable = !message.pending;

  return (
    <Flex
      role="group"
      py="1"
      px="2"
      gap="2"
      alignItems="center"
      rounded="md"
      bg={isSelected ? "app.hover" : "transparent"}
      cursor={selectionMode && selectable ? "pointer" : "default"}
      justifyContent={isMine ? "flex-end" : "flex-start"}
      onClick={() => {
        // Setelah ada satu pesan terpilih, klik di mana pun ikut memilih.
        if (selectionMode && selectable) onToggleSelect(message.id);
      }}
    >
      {selectable && (
        <Checkbox
          colorScheme="green"
          isChecked={isSelected}
          // Kotak pilih hanya muncul saat disorot, atau saat mode pilih aktif.
          opacity={selectionMode || isSelected ? 1 : 0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.15s ease"
          onChange={() => onToggleSelect(message.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <Box
        px="3"
        py="2"
        maxW="75%"
        rounded="lg"
        bg={isMine ? "green.500" : "app.card"}
        // Putih hanya di atas hijau; gelembung lawan bicara mengikuti tema,
        // kalau tidak teksnya hilang di atas abu-abu muda mode terang.
        color={isMine ? "white" : "app.text"}
      >
        {/* Penanda ala WhatsApp: muncul di atas isi pesan, dengan warna
            redup supaya tidak bersaing dengan isinya. */}
        {message.is_forwarded && (
          <Flex alignItems="center" gap="1" mb="0.5">
            <LuForward size="12" />
            <Text fontSize="xs" fontStyle="italic" opacity={0.8}>
              {t("chat.forwarded")}
            </Text>
          </Flex>
        )}

        {/* Di grup perlu tahu siapa yang bicara; di DM sudah jelas. */}
        {isGroup && !isMine && (
          <Text fontSize="xs" color="green.300" fontWeight="semibold">
            {message.sender?.name || t("common.unknownUser")}
          </Text>
        )}

        {images.length > 0 && (
          <>
            <ImageGrid images={images} onOpen={openAt} mt="1" mb="1" />

            <ImageViewer
              isOpen={isImageOpen}
              onClose={onImageClose}
              images={images}
              startIndex={startIndex}
              author={message.sender}
              createdAt={message.created_at}
            />
          </>
        )}

        {message.content && (
          <Text fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-word">
            {message.content}
          </Text>
        )}

        <Flex justifyContent="flex-end" alignItems="center" gap="1">
          <Text fontSize="10px" color={isMine ? "green.100" : "gray.500"}>
            {clock(message.created_at, locale)}
          </Text>

          {/* Status pengiriman hanya relevan untuk pesan sendiri:
              jam = belum sampai server, satu centang = terkirim,
              dua centang = sudah dibaca semua lawan bicara. */}
          {isMine &&
            (message.pending ? (
              <LuClock size="11" color="#C6F6D5" />
            ) : message.isRead ? (
              <LuCheckCheck size="13" color="#63B3ED" />
            ) : (
              <LuCheck size="13" color="#C6F6D5" />
            ))}
        </Flex>
      </Box>
    </Flex>
  );
};

export default MessageBubble;
