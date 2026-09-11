/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Flex,
  IconButton,
  Image,
  Input,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { LuImage, LuSend, LuX } from "react-icons/lu";
import { useChatHooks } from "../hooks/chat";

// Sama dengan MAX_IMAGES di backend.
const MAX_IMAGES = 4;

const CreateMessage = ({ conversationId }: { conversationId: string }) => {
  const { sendMessage } = useChatHooks();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);

  const clearImages = () => {
    setImages([]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const pickImages = (picked: File[]) => {
    setImages((current) => {
      if (current.length + picked.length > MAX_IMAGES) {
        toast({
          position: "top",
          title: `Maksimal ${MAX_IMAGES} gambar.`,
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
      }
      return [...current, ...picked].slice(0, MAX_IMAGES);
    });

    // Direset supaya memilih berkas yang sama lagi tetap memicu onChange.
    if (fileInput.current) fileInput.current.value = "";
  };

  // Tidak menunggu server. Pesannya sudah tampil (optimistic) begitu
  // sendMessage dipanggil, jadi input langsung dikosongkan dan pesan berikutnya
  // bisa diketik tanpa menunggu yang sebelumnya selesai terkirim. Dulu input
  // terkunci sampai respons datang, termasuk selama gambar diunggah.
  const handleSubmit = () => {
    const text = content.trim();
    if (!text && !images.length) return;

    const picked = images;
    setContent("");
    clearImages();

    sendMessage(conversationId, {
      content: text,
      images: picked,
      // Mencocokkan pesan sementara dengan versi server (lewat respons POST
      // maupun event socket), supaya tidak tampil dua kali.
      client_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    }).catch((error: any) => {
      toast({
        position: "top",
        title: error.response?.data?.message || "Gagal mengirim pesan!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      // Teksnya dikembalikan supaya tidak perlu diketik ulang, kecuali user
      // sudah mulai mengetik pesan lain.
      setContent((current) => current || text);
    });
  };

  return (
    <Box pt="2">
      {images.length > 0 && (
        <Flex mb="2" gap="2" flexWrap="wrap">
          {images.map((image, index) => (
            <Box key={index} position="relative" w="fit-content">
              <Image
                src={URL.createObjectURL(image)}
                alt="preview"
                h="80px"
                w="80px"
                objectFit="cover"
                rounded="md"
              />
              <IconButton
                size="xs"
                top="1"
                right="1"
                rounded="full"
                position="absolute"
                aria-label="Hapus gambar"
                icon={<LuX />}
                onClick={() =>
                  setImages((current) => current.filter((_, i) => i !== index))
                }
              />
            </Box>
          ))}
        </Flex>
      )}

      <Flex gap="2" alignItems="center">
        <IconButton
          rounded="full"
          bg="none"
          color="green.500"
          aria-label="Kirim gambar"
          icon={<LuImage />}
          _hover={{ bg: "app.card" }}
          onClick={() => fileInput.current?.click()}
        />

        <Input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          display="none"
          onChange={(e) => pickImages(Array.from(e.target.files || []))}
        />

        <Input
          rounded="full"
          placeholder="Tulis pesan"
          borderColor="app.border"
          focusBorderColor="green.500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            // Enter mengirim, Shift+Enter dibiarkan untuk baris baru.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <Spacer />

        <IconButton
          rounded="full"
          bg="green.500"
          color="white"
          aria-label="Kirim"
          icon={<LuSend />}
          _hover={{ color: "green.500", bg: "app.inverse" }}
          onClick={handleSubmit}
        />
      </Flex>
    </Box>
  );
};

export default CreateMessage;
