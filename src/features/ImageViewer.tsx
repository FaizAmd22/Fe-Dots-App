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
import { useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuDownload, LuX } from "react-icons/lu";
import { useTranslation } from "../i18n/useTranslation";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  startIndex?: number;
  author?: { name?: string; picture?: string } | null;
  // Waktu gambar tersimpan di database (created_at milik thread/reply/pesan).
  createdAt?: string;
}

// Jarak geser horizontal minimum (px) supaya dianggap swipe, bukan ketukan.
const SWIPE_THRESHOLD = 50;

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

const formatSavedAt = (value: string | undefined, locale: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tombol ikon di atas latar gelap viewer (viewer selalu gelap di kedua tema).
const iconButtonStyle = {
  bg: "none",
  color: "white",
  rounded: "full",
  _hover: { bg: "whiteAlpha.200" },
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
  const { t, locale } = useTranslation();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const thumbRefs = useRef<Array<HTMLDivElement | null>>([]);

  const total = images.length;
  const hasMany = total > 1;
  const current = images[index];

  // Selalu mulai dari gambar yang diklik, bukan dari sisa kunjungan sebelumnya.
  useEffect(() => {
    if (isOpen) setIndex(startIndex);
  }, [isOpen, startIndex]);

  // Thumbnail gambar yang sedang tampil digulir ke tengah, supaya tetap terlihat
  // walau barisnya lebih lebar dari layar HP.
  useEffect(() => {
    if (!isOpen) return;
    thumbRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index, isOpen]);

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

  // Geser kiri/kanan di HP. Gerakan yang lebih vertikal daripada horizontal
  // diabaikan, supaya tidak berpindah gambar saat user hanya menggulir.
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !hasMany) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) goNext();
    else goPrev();
  };

  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
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
        title: t("viewer.openedInTab"),
        status: "info",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!total) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      {/* Warna latar aplikasi (#1D1D1D), semi-transparan, ditambah blur: tanpa
          blur, isi halaman di belakang (feed, navbar bawah) ikut terbaca dan
          tampilannya ramai, terutama di HP. */}
      <ModalOverlay bg="rgba(29, 29, 29, 0.9)" backdropFilter="blur(10px)" />

      <ModalContent bg="transparent" boxShadow="none" m="0" rounded="none" color="white">
        {/* 100dvh, bukan 100vh: di browser HP 100vh ikut menghitung area di
            balik bilah alamat, sehingga header terpotong di atas. Padding
            safe-area memberi ruang untuk notch dan home indicator. */}
        <Flex
          direction="column"
          h="100vh"
          sx={{ "@supports (height: 100dvh)": { height: "100dvh" } }}
          pt="env(safe-area-inset-top)"
          pb="env(safe-area-inset-bottom)"
          onClick={onClose}
        >
          {/* Klik di area kosong menutup, tapi klik pada isi jangan ikut menutup. */}
          <Flex
            px={{ base: "2", md: "4" }}
            py={{ base: "2", md: "3" }}
            gap={{ base: "2", md: "3" }}
            alignItems="center"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              w={{ base: "34px", md: "40px" }}
              h={{ base: "34px", md: "40px" }}
              flexShrink={0}
              name={author?.name}
              src={author?.picture}
            />

            {/* minW 0: tanpa ini nama panjang mendorong tombol keluar layar. */}
            <Box minW="0">
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="semibold"
                noOfLines={1}
              >
                {author?.name || t("common.unknownUser")}
              </Text>
              <Text fontSize="xs" color="gray.400" noOfLines={1}>
                {formatSavedAt(createdAt, locale)}
              </Text>
            </Box>

            <Spacer />

            {hasMany && (
              <Text fontSize="sm" color="gray.400" flexShrink={0} mr={{ base: "0", md: "2" }}>
                {index + 1} / {total}
              </Text>
            )}

            <IconButton
              {...iconButtonStyle}
              fontSize="xl"
              flexShrink={0}
              aria-label={t("viewer.download")}
              title={t("viewer.download")}
              icon={<LuDownload />}
              isLoading={isDownloading}
              onClick={handleDownload}
            />

            <IconButton
              {...iconButtonStyle}
              fontSize="xl"
              flexShrink={0}
              aria-label={t("viewer.close")}
              title={t("viewer.close")}
              icon={<LuX />}
              onClick={onClose}
            />
          </Flex>

          <Flex
            position="relative"
            flex="1"
            minH="0"
            px={{ base: "2", md: "4" }}
            pb="2"
            alignItems="center"
            justifyContent="center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={current}
              alt=""
              maxH="100%"
              maxW="100%"
              objectFit="contain"
              // Gambar tidak ikut terseret browser saat di-swipe.
              draggable={false}
              userSelect="none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Di HP panah ada di kiri-kanan gambar: di baris thumbnail
                ruangnya terlalu sempit dan tombolnya terjepit di tepi. */}
            {hasMany && (
              <>
                <IconButton
                  display={{ base: "inline-flex", md: "none" }}
                  position="absolute"
                  left="2"
                  top="50%"
                  transform="translateY(-50%)"
                  size="sm"
                  rounded="full"
                  bg="blackAlpha.600"
                  color="white"
                  fontSize="xl"
                  _hover={{ bg: "blackAlpha.700" }}
                  _active={{ bg: "blackAlpha.800" }}
                  aria-label={t("viewer.prev")}
                  icon={<LuChevronLeft />}
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                />
                <IconButton
                  display={{ base: "inline-flex", md: "none" }}
                  position="absolute"
                  right="2"
                  top="50%"
                  transform="translateY(-50%)"
                  size="sm"
                  rounded="full"
                  bg="blackAlpha.600"
                  color="white"
                  fontSize="xl"
                  _hover={{ bg: "blackAlpha.700" }}
                  _active={{ bg: "blackAlpha.800" }}
                  aria-label={t("viewer.next")}
                  icon={<LuChevronRight />}
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                />
              </>
            )}
          </Flex>

          {hasMany && (
            <Flex
              px={{ base: "2", md: "4" }}
              py={{ base: "3", md: "4" }}
              gap="3"
              alignItems="center"
              justifyContent="center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panah desktop tetap di samping thumbnail. */}
              <IconButton
                {...iconButtonStyle}
                display={{ base: "none", md: "inline-flex" }}
                fontSize="2xl"
                aria-label={t("viewer.prev")}
                icon={<LuChevronLeft />}
                onClick={goPrev}
              />

              <Flex
                gap="2"
                overflowX="auto"
                maxW={{ base: "100%", md: "70vw" }}
                py="1"
                px="1"
                sx={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
              >
                {images.map((image, thumbIndex) => (
                  <Box
                    key={image + thumbIndex}
                    ref={(el: HTMLDivElement | null) => {
                      thumbRefs.current[thumbIndex] = el;
                    }}
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
                      w={{ base: "52px", md: "70px" }}
                      h={{ base: "52px", md: "70px" }}
                      objectFit="cover"
                      draggable={false}
                    />
                  </Box>
                ))}
              </Flex>

              <IconButton
                {...iconButtonStyle}
                display={{ base: "none", md: "inline-flex" }}
                fontSize="2xl"
                aria-label={t("viewer.next")}
                icon={<LuChevronRight />}
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
