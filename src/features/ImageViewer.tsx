/* eslint-disable react-hooks/exhaustive-deps */
import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuDownload, LuX } from "react-icons/lu";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  startIndex?: number;
  author?: { name?: string; picture?: string } | null;
  // Waktu gambar tersimpan di database (created_at milik thread/reply/pesan).
  createdAt?: string;
}

// Kode acak pendek: waktu unduh (base36) + sedikit keacakan, supaya dua gambar
// yang diunduh pada milidetik yang sama pun tidak bertabrakan namanya.
const uniqueCode = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// Ekstensi diambil dari tipe blob lebih dulu karena lebih dapat dipercaya
// daripada menebak dari URL; URL dipakai sebagai cadangan.
const extensionOf = (blobType: string, url: string) => {
  const fromBlob = blobType.split("/")[1]?.split("+")[0];
  if (fromBlob) return `.${fromBlob === "jpeg" ? "jpg" : fromBlob}`;

  const match = url.split("?")[0].match(/\.(jpe?g|png|gif|webp|avif|bmp)$/i);
  return match ? match[0].toLowerCase() : ".jpg";
};

const formatSavedAt = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ImageViewer = ({
  isOpen,
  onClose,
  images,
  startIndex = 0,
  author,
  createdAt,
}: ImageViewerProps) => {
  const [index, setIndex] = useState<number>(startIndex);
  const toast = useToast();

  const total = images.length;
  const hasMany = total > 1;
  const current = images[index];

  // Selalu mulai dari gambar yang diklik, bukan dari sisa kunjungan sebelumnya.
  useEffect(() => {
    if (isOpen) setIndex(startIndex);
  }, [isOpen, startIndex]);

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  // Panah kiri/kanan ikut jalan; Esc sudah ditangani Modal.
  useEffect(() => {
    if (!isOpen || !hasMany) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, hasMany, total]);

  const handleDownload = async () => {
    try {
      // Diambil sebagai blob supaya benar-benar terunduh; atribut download saja
      // tidak berlaku untuk gambar dari domain lain seperti Cloudinary.
      const response = await fetch(current);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `dots-image-${uniqueCode()}${extensionOf(
        blob.type,
        current
      )}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      // Kalau diblokir CORS, minimal gambarnya dibuka supaya masih bisa disimpan manual.
      window.open(current, "_blank");
      toast({
        position: "top",
        title: "Gambar dibuka di tab baru, silakan simpan dari sana.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  if (!total) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      {/* Warna latar aplikasi (#1D1D1D) dengan opacity 80%. */}
      <ModalOverlay bg="rgba(29, 29, 29, 0.9)" />

      <ModalContent bg="transparent" boxShadow="none" m="0" color="white">
        <Flex direction="column" h="100vh" onClick={onClose}>
          {/* Klik di area kosong menutup, tapi klik pada isi jangan ikut menutup. */}
          <Flex
            px="4"
            py="3"
            gap="3"
            alignItems="center"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              w="40px"
              h="40px"
              name={author?.name}
              src={author?.picture}
            />

            <Box>
              <Text fontSize="md" fontWeight="semibold">
                {author?.name || "Unknown user"}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {formatSavedAt(createdAt)}
              </Text>
            </Box>

            <Spacer />

            {hasMany && (
              <Text fontSize="sm" color="gray.400" mr="2">
                {index + 1} / {total}
              </Text>
            )}

            <IconButton
              bg="none"
              color="white"
              rounded="full"
              fontSize="xl"
              aria-label="Unduh gambar"
              title="Unduh gambar"
              icon={<LuDownload />}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={handleDownload}
            />

            <IconButton
              bg="none"
              color="white"
              rounded="full"
              fontSize="xl"
              aria-label="Tutup"
              title="Tutup"
              icon={<LuX />}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={onClose}
            />
          </Flex>

          <Flex flex="1" minH="0" px="4" pb="2" justifyContent="center">
            <Image
              src={current}
              alt=""
              maxH="100%"
              maxW="100%"
              objectFit="contain"
              onClick={(e) => e.stopPropagation()}
            />
          </Flex>

          {hasMany && (
            <Flex
              px="4"
              py="4"
              gap="3"
              alignItems="center"
              justifyContent="center"
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                bg="none"
                color="white"
                rounded="full"
                fontSize="2xl"
                aria-label="Gambar sebelumnya"
                icon={<LuChevronLeft />}
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={goPrev}
              />

              <Flex gap="2" overflowX="auto" maxW="70vw" py="1">
                {images.map((image, thumbIndex) => (
                  <Box
                    key={image + thumbIndex}
                    flexShrink={0}
                    rounded="md"
                    overflow="hidden"
                    cursor="pointer"
                    border="2px"
                    // Gambar yang sedang tampil ditandai warna aksen aplikasi.
                    borderColor={
                      thumbIndex === index ? "green.500" : "transparent"
                    }
                    opacity={thumbIndex === index ? 1 : 0.6}
                    transition="opacity 0.15s ease, border-color 0.15s ease"
                    _hover={{ opacity: 1 }}
                    onClick={() => setIndex(thumbIndex)}
                  >
                    <Image
                      src={image}
                      alt=""
                      w="70px"
                      h="70px"
                      objectFit="cover"
                    />
                  </Box>
                ))}
              </Flex>

              <IconButton
                bg="none"
                color="white"
                rounded="full"
                fontSize="2xl"
                aria-label="Gambar berikutnya"
                icon={<LuChevronRight />}
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={goNext}
              />
            </Flex>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default ImageViewer;
