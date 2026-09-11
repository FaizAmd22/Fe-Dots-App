import {
  Button,
  Circle,
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { ReactElement } from "react";

export type ConfirmTone = "default" | "danger";

const TONE = {
  default: { tint: "rgba(56, 161, 105, 0.14)", color: "green.500", button: "green.500", hover: "green.600" },
  danger: { tint: "rgba(229, 62, 62, 0.14)", color: "red.500", button: "red.500", hover: "red.600" },
};

// Dialog konfirmasi seragam untuk seluruh aplikasi (menggantikan SweetAlert):
// kartu ringkas yang ikut tema, ikon bernada warna, dan dua tombol.
const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  tone = "default",
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  tone?: ConfirmTone;
  icon?: ReactElement;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const palette = TONE[tone];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      size="sm"
      motionPreset="scale"
      // Selama proses berjalan dialog tidak boleh ditutup setengah jalan.
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />

      <ModalContent
        mx="4"
        p="6"
        bg="app.card"
        color="app.text"
        rounded="2xl"
        border="1px"
        borderColor="app.borderSubtle"
        boxShadow="xl"
      >
        {icon && (
          <Circle size="44px" mb="4" bg={palette.tint} color={palette.color} fontSize="xl">
            {icon}
          </Circle>
        )}

        <Text as="h2" fontSize="lg" fontWeight="semibold" lineHeight="short">
          {title}
        </Text>

        {description && (
          <Text mt="1.5" fontSize="sm" color="app.textMuted">
            {description}
          </Text>
        )}

        <Flex
          mt="6"
          gap="2"
          direction={{ base: "column-reverse", sm: "row" }}
          justifyContent="flex-end"
        >
          <Button
            variant="ghost"
            rounded="xl"
            color="app.textSoft"
            w={{ base: "100%", sm: "auto" }}
            _hover={{ bg: "app.hover" }}
            isDisabled={isLoading}
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            rounded="xl"
            bg={palette.button}
            color="white"
            w={{ base: "100%", sm: "auto" }}
            _hover={{ bg: palette.hover }}
            _active={{ bg: palette.hover }}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDialog;
