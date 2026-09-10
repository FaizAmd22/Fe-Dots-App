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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatHooks } from "../../../hooks/chat";
import { API } from "../../../libs/axios";
import { IUsers } from "../../../interfaces/UsersInterface";

const NewChatModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const token = sessionStorage.getItem("token");
  const myId = Number(sessionStorage.getItem("id"));
  const navigate = useNavigate();
  const toast = useToast();
  const { createConversation, fetchConversations } = useChatHooks();

  const [users, setUsers] = useState<IUsers[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Memakai ulang endpoint /search yang sudah mengembalikan seluruh user,
  // jadi tidak perlu endpoint baru. Diambil sekali saat modal dibuka.
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
  const filtered = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(search) ||
      user.name?.toLowerCase().includes(search)
  );

  const close = () => {
    setKeyword("");
    setSelected([]);
    setGroupName("");
    onClose();
  };

  const openConversation = async (participantIds: number[], name?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const conversationId = await createConversation(participantIds, name);
      await fetchConversations();
      close();
      navigate(`/chat/${conversationId}`);
    } catch (error: any) {
      toast({
        position: "top",
        title: error.response?.data?.message || "Gagal memulai percakapan!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggle = (id: number) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const searchInput = (
    <Input
      mb="3"
      type="text"
      placeholder="Cari nama atau username"
      borderColor="gray.600"
      focusBorderColor="green.500"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent bg="#1D1D1D" color="white">
        <ModalHeader>Chat baru</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="4">
          <Tabs variant="unstyled">
            <TabList mb="3">
              <Tab _selected={{ color: "green.500", fontWeight: "semibold" }}>Personal</Tab>
              <Tab _selected={{ color: "green.500", fontWeight: "semibold" }}>Grup</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px="0">
                {searchInput}

                <Box maxH="40vh" overflowY="auto">
                  {filtered.map((user) => (
                    <Flex
                      key={user.id}
                      py="2"
                      px="2"
                      rounded="md"
                      alignItems="center"
                      cursor="pointer"
                      _hover={{ bg: "#262626" }}
                      onClick={() => openConversation([user.id as number])}
                    >
                      <Avatar w="35px" h="35px" name={user.name} src={user.picture} />
                      <Box pl="3">
                        <Text fontSize="sm">{user.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          @{user.username}
                        </Text>
                      </Box>
                    </Flex>
                  ))}

                  {!filtered.length && (
                    <Text color="gray.500" fontSize="sm" textAlign="center" py="4">
                      User tidak ditemukan
                    </Text>
                  )}
                </Box>
              </TabPanel>

              <TabPanel px="0">
                <Input
                  mb="3"
                  type="text"
                  placeholder="Nama grup"
                  borderColor="gray.600"
                  focusBorderColor="green.500"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />

                {searchInput}

                <Box maxH="30vh" overflowY="auto">
                  {filtered.map((user) => (
                    <Flex key={user.id} py="2" px="2" alignItems="center">
                      <Checkbox
                        colorScheme="green"
                        isChecked={selected.includes(user.id as number)}
                        onChange={() => toggle(user.id as number)}
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
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button
            rounded="full"
            bg="green.500"
            color="white"
            _hover={{ color: "green.500", bg: "white" }}
            isLoading={isSubmitting}
            // Grup butuh minimal dua orang lain; satu orang berarti DM biasa.
            isDisabled={selected.length < 2 || !groupName.trim()}
            onClick={() => openConversation(selected, groupName.trim())}
          >
            Buat grup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewChatModal;
