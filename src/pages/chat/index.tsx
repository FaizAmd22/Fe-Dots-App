/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Flex,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LuMessageSquarePlus } from "react-icons/lu";
import { LoadingConversationCard } from "../../component/LoadingCard";
import { useChatHooks } from "../../hooks/chat";
import { IConversation } from "../../interfaces/ChatInterface";
import { selectConversations } from "../../slices/chatSlice";
import ConversationCard from "./components/ConversationCard";
import NewChatModal from "./components/NewChatModal";

const Chat = () => {
  const { fetchConversations } = useChatHooks();
  const conversations = useSelector(selectConversations);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const loopingLoading = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    const fetchData = async () => {
      await fetchConversations();
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Stack h={{ base: "78vh", md: "100vh" }} px="4" pb="0" color="white">
      <Flex alignItems="center" py={{ base: "0", md: "4" }}>
        <Text fontSize="2xl" fontWeight="semibold">
          Chat
        </Text>

        <Spacer />

        <Button
          size="sm"
          rounded="full"
          bg="green.500"
          color="white"
          leftIcon={<LuMessageSquarePlus />}
          _hover={{ color: "green.500", bg: "white" }}
          onClick={onOpen}
        >
          Baru
        </Button>
      </Flex>

      <Box
        h="84vh"
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
        {isLoading ? (
          <Stack gap="6" pt="4">
            {loopingLoading.map((_, index: number) => (
              <LoadingConversationCard key={index} />
            ))}
          </Stack>
        ) : conversations.length ? (
          conversations.map((conversation: IConversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))
        ) : (
          <Text color="gray.500" textAlign="center" pt="20">
            Belum ada percakapan. Mulai chat lewat tombol "Baru".
          </Text>
        )}
      </Box>

      <NewChatModal isOpen={isOpen} onClose={onClose} />
    </Stack>
  );
};

export default Chat;
