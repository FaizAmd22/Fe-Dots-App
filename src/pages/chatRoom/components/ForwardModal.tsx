/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useChatHooks } from "../../../hooks/chat";
import { conversationTitle, otherParticipant } from "../../../features/ChatHelpers";
import { IConversation } from "../../../interfaces/ChatInterface";
import { IUsers } from "../../../interfaces/UsersInterface";
import { API } from "../../../libs/axios";
import { selectConversations } from "../../../slices/chatSlice";
import { useTranslation } from "../../../i18n/useTranslation";

const ForwardModal = ({
  isOpen,
  onClose,
  messageIds,
  onForwarded,
}: {
  isOpen: boolean;
  onClose: () => void;
  messageIds: string[];
  onForwarded: () => void;
}) => {
  const token = sessionStorage.getItem("token");
  const myId = Number(sessionStorage.getItem("id"));
  const toast = useToast();
  const { t } = useTranslation();
  const { forwardMessages, fetchConversations } = useChatHooks();
  const conversations = useSelector(selectConversations);

  const [users, setUsers] = useState<IUsers[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [pickedConversations, setPickedConversations] = useState<string[]>([]);
  const [pickedUsers, setPickedUsers] = useState<number[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const getUsers = async () => {
      try {
        const response = await API.get("/search", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.filter((user: IUsers) => user.id !== myId));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getUsers();
  }, [isOpen]);

  const search = keyword.toLowerCase();

  const matchedConversations = (conversations as IConversation[]).filter((conversation) =>
    conversationTitle(conversation, myId, t).toLowerCase().includes(search)
  );

  // User yang sudah punya DM disembunyikan dari daftar bawah, supaya tujuan
  // yang sama tidak muncul dua kali dengan dua cara memilih.
  const dmPartnerIds = (conversations as IConversation[])
    .filter((conversation) => !conversation.is_group)
    .map((conversation) => otherParticipant(conversation, myId)?.id);

  const matchedUsers = users.filter(
    (user) =>
      !dmPartnerIds.includes(user.id as number) &&
      (user.username?.toLowerCase().includes(search) ||
        user.name?.toLowerCase().includes(search))
  );

  const totalPicked = pickedConversations.length + pickedUsers.length;

  const toggle = <T,>(id: T, picked: T[], setPicked: (value: T[]) => void) =>
    setPicked(
      picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id]
    );

  const close = () => {
    setKeyword("");
    setPickedConversations([]);
    setPickedUsers([]);
    onClose();
  };

  const handleForward = async () => {
    if (isSending || !totalPicked) return;
    setIsSending(true);

    try {
      await forwardMessages(messageIds, {
        conversationIds: pickedConversations,
        userIds: pickedUsers,
      });

      // Daftar percakapan berubah: urutannya bergeser, dan DM baru bisa muncul.
      await fetchConversations();

      toast({
        position: "top",
        title: t("chat.forwardSuccess", { count: totalPicked }),
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      close();
      onForwarded();
    } catch (error: any) {
      toast({
        position: "top",
        title: error.response?.data?.message || t("chat.forwardFailed"),
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent bg="app.bg" color="app.text">
        <ModalHeader>
          {t("chat.forwardTitle", { count: messageIds.length })}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="4">
          <Input
            mb="3"
            type="text"
            placeholder={t("chat.forwardSearch")}
            borderColor="app.border"
            focusBorderColor="green.500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <Box maxH="45vh" overflowY="auto">
            {matchedConversations.length > 0 && (
              <Text fontSize="xs" color="gray.500" mb="1">
                {t("chat.conversations")}
              </Text>
            )}

            {matchedConversations.map((conversation) => {
              const other = otherParticipant(conversation, myId);
              const title = conversationTitle(conversation, myId, t);

              return (
                <Flex key={`c-${conversation.id}`} py="2" px="1" alignItems="center">
                  <Checkbox
                    colorScheme="green"
                    isChecked={pickedConversations.includes(conversation.id)}
                    onChange={() =>
                      toggle(conversation.id, pickedConversations, setPickedConversations)
                    }
                  />
                  <Avatar
                    ml="3"
                    w="35px"
                    h="35px"
                    name={title}
                    src={conversation.is_group ? undefined : other?.picture}
                  />
                  <Box pl="3">
                    <Text fontSize="sm">{title}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {conversation.is_group
                        ? t("chat.members", { count: conversation.participants.length })
                        : `@${other?.username}`}
                    </Text>
                  </Box>
                </Flex>
              );
            })}

            {matchedUsers.length > 0 && (
              <Text fontSize="xs" color="gray.500" mt="3" mb="1">
                {t("chat.otherUsers")}
              </Text>
            )}

            {matchedUsers.map((user) => (
              <Flex key={`u-${user.id}`} py="2" px="1" alignItems="center">
                <Checkbox
                  colorScheme="green"
                  isChecked={pickedUsers.includes(user.id as number)}
                  onChange={() => toggle(user.id as number, pickedUsers, setPickedUsers)}
                />
                <Avatar ml="3" w="35px" h="35px" name={user.name} src={user.picture} />
                <Box pl="3">
                  <Text fontSize="sm">{user.name}</Text>
                  <Text fontSize="xs" color="gray.500">
                    @{user.username}
                  </Text>
                </Box>
              </Flex>
            ))}

            {!matchedConversations.length && !matchedUsers.length && (
              <Text color="gray.500" fontSize="sm" textAlign="center" py="4">
                {t("chat.noTargets")}
              </Text>
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            rounded="full"
            bg="green.500"
            color="white"
            _hover={{ color: "green.500", bg: "app.inverse" }}
            isLoading={isSending}
            isDisabled={!totalPicked}
            onClick={handleForward}
          >
            {totalPicked ? t("chat.forwardCount", { count: totalPicked }) : t("chat.forward")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ForwardModal;
