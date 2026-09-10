/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { BiSolidImageAdd } from "react-icons/bi";
import { API } from "../libs/axios";
import { useThreadsHooks } from "../hooks/threads";
import { useDetailThreadHooks } from "../hooks/detailThread";
import { useProfileThreadHooks } from "../hooks/profileThread";

// Sama dengan MAX_IMAGES di backend.
const MAX_IMAGES = 4;

const EditPostModal = ({
  isOpen,
  onClose,
  id,
  type,
  content,
  images,
}: {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  // "threads" atau "replies", menentukan endpoint yang dipakai.
  type?: string;
  content?: string | null;
  images?: string[];
}) => {
  const token = sessionStorage.getItem("token");
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const { fetchThreadAuth } = useThreadsHooks();
  const { fetchDetailAuth } = useDetailThreadHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();

  const [draft, setDraft] = useState<string>(content || "");
  // Gambar lama yang masih dipertahankan. Dipisah dari gambar baru supaya user
  // bisa membuang satu saja tanpa harus mengunggah ulang semuanya.
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const totalImages = keptImages.length + newImages.length;

  // Isi ulang setiap modal dibuka, supaya suntingan yang dibatalkan tidak
  // tertinggal saat dibuka lagi.
  useEffect(() => {
    if (!isOpen) return;
    setDraft(content || "");
    setKeptImages(images || []);
    setNewImages([]);
    if (fileInput.current) fileInput.current.value = "";
  }, [isOpen, content]);

  const pickImages = (picked: File[]) => {
    const room = MAX_IMAGES - totalImages;

    if (picked.length > room) {
      toast({
        position: "top",
        title: `Maksimal ${MAX_IMAGES} gambar.`,
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
    }

    if (room > 0) setNewImages((current) => [...current, ...picked.slice(0, room)]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!draft.trim() && !totalImages) {
      return toast({
        position: "top",
        title: "Konten tidak boleh kosong!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }

    setIsSaving(true);

    const body = new FormData();
    body.append("content", draft.trim());
    // Daftar gambar lama yang dipertahankan. Dikirim sebagai JSON supaya daftar
    // kosong (semua gambar dihapus) bisa dibedakan dari tidak mengirim apa pun.
    body.append("keepImages", JSON.stringify(keptImages));
    newImages.forEach((image) => body.append("image", image));

    try {
      const url = type === "threads" ? `/thread/${id}` : `/reply/${id}`;

      await API.patch(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        position: "top",
        title: type === "threads" ? "Thread diperbarui!" : "Balasan diperbarui!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      onClose();

      // Hook detail berhenti sendiri kalau halamannya bukan halaman detail.
      fetchThreadAuth();
      fetchDetailAuth();
      fetchProfileThreadAuth();
    } catch (error: any) {
      toast({
        position: "top",
        title: error.response?.data?.message || "Gagal menyimpan perubahan!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="#1D1D1D" color="white">
        <ModalHeader>
          {type === "threads" ? "Edit thread" : "Edit balasan"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="4">
          <Textarea
            rows={4}
            placeholder="Tulis sesuatu..."
            borderColor="gray.600"
            focusBorderColor="green.500"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />

          {totalImages > 0 && (
            <Box mt="3">
              <Text fontSize="xs" color="gray.500" mb="1">
                Gambar ({totalImages}/{MAX_IMAGES})
              </Text>

              <Flex gap="2" flexWrap="wrap">
                {/* Gambar lama dan gambar baru ditampilkan berdampingan, karena
                    bagi user keduanya sama saja: isi unggahan ini nantinya. */}
                {keptImages.map((image, index) => (
                  <Box key={image + index} position="relative">
                    <IconButton
                      icon={<IoCloseCircle />}
                      position="absolute"
                      top="-10px"
                      right="-10px"
                      zIndex="1"
                      bg="none"
                      isRound
                      color="red.600"
                      fontSize="22px"
                      aria-label="Hapus gambar"
                      _hover={{ bg: "none", color: "white" }}
                      onClick={() =>
                        setKeptImages((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                    />
                    <Image
                      src={image}
                      h="70px"
                      w="70px"
                      rounded="md"
                      objectFit="cover"
                    />
                  </Box>
                ))}

                {newImages.map((image, index) => (
                  <Box key={index} position="relative">
                    <IconButton
                      icon={<IoCloseCircle />}
                      position="absolute"
                      top="-10px"
                      right="-10px"
                      zIndex="1"
                      bg="none"
                      isRound
                      color="red.600"
                      fontSize="22px"
                      aria-label="Hapus gambar"
                      _hover={{ bg: "none", color: "white" }}
                      onClick={() =>
                        setNewImages((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                    />
                    <Image
                      src={URL.createObjectURL(image)}
                      h="70px"
                      w="70px"
                      rounded="md"
                      objectFit="cover"
                      border="2px"
                      borderColor="green.500"
                    />
                  </Box>
                ))}
              </Flex>
            </Box>
          )}

          <Input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            display="none"
            onChange={(e) => pickImages(Array.from(e.target.files || []))}
          />

          <Button
            mt="3"
            size="sm"
            bg="none"
            color="green.500"
            leftIcon={<BiSolidImageAdd />}
            isDisabled={totalImages >= MAX_IMAGES}
            _hover={{ bg: "#262626" }}
            onClick={() => fileInput.current?.click()}
          >
            Tambah gambar
          </Button>
        </ModalBody>

        <ModalFooter gap="2">
          <Button variant="ghost" color="gray.400" onClick={onClose}>
            Batal
          </Button>
          <Button
            rounded="full"
            bg="green.500"
            color="white"
            _hover={{ color: "green.500", bg: "white" }}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Simpan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPostModal;
