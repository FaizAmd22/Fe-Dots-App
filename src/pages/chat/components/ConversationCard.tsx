import { Avatar, Badge, Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { LuCheck, LuCheckCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { IConversation } from "../../../interfaces/ChatInterface";
import {
  conversationTitle,
  FALLBACK_AVATAR,
  otherParticipant,
} from "../../../features/ChatHelpers";
import { useTranslation } from "../../../i18n/useTranslation";

const ConversationCard = ({ conversation }: { conversation: IConversation }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const myId = Number(sessionStorage.getItem("id"));
  const other = otherParticipant(conversation, myId);
  const title = conversationTitle(conversation, myId, t);

  const lastMessage = conversation.lastMessage;

  const subtitle = lastMessage
    ? lastMessage.content || (lastMessage.image ? t("common.photo") : "")
    : t("chat.noMessagesYet");

  // Centang hanya untuk pesan terakhir yang kita kirim sendiri — status baca
  // pesan orang lain bukan urusan kita.
  const isLastMessageMine = Number(lastMessage?.senderId) === myId;

  return (
    <Flex
      py="3"
      px="2"
      rounded="lg"
      cursor="pointer"
      alignItems="center"
      // Sama dengan kartu notifikasi: sorotan tipis yang ikut tema, bukan
      // warna surface (di mode terang surface bisa berwarna penuh).
      transition="background-color 0.15s ease"
      _hover={{ bg: "app.hover" }}
      onClick={() => navigate(`/chat/${conversation.id}`)}
    >
      <Avatar
        w="50px"
        h="50px"
        name={title}
        src={conversation.is_group ? undefined : other?.picture || FALLBACK_AVATAR}
      />

      <Box pl="3" overflow="hidden">
        <Text fontSize="md" noOfLines={1}>
          {title}
        </Text>
        <Flex alignItems="center" gap="1">
          {isLastMessageMine && (
            <Box flexShrink={0} display="flex" alignItems="center">
              {lastMessage?.isRead ? (
                <LuCheckCheck size="14" color="#63B3ED" />
              ) : (
                <LuCheck size="14" color="#A0AEC0" />
              )}
            </Box>
          )}

          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            {subtitle}
          </Text>
        </Flex>
      </Box>

      <Spacer />

      {conversation.unreadCount > 0 && (
        <Badge
          px="2"
          rounded="full"
          bg="green.500"
          color="white"
          fontSize="xs"
          flexShrink={0}
        >
          {conversation.unreadCount}
        </Badge>
      )}
    </Flex>
  );
};

export default ConversationCard;
