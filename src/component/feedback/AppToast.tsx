import { AlertStatus, Box, Circle, CloseButton, Flex, Spinner, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { LuAlertTriangle, LuCheck, LuInfo, LuX } from "react-icons/lu";

const STATUS: Record<Exclude<AlertStatus, "loading">, { icon: JSX.Element; color: string }> = {
  success: { icon: <LuCheck />, color: "green.500" },
  error: { icon: <LuX />, color: "red.500" },
  warning: { icon: <LuAlertTriangle />, color: "orange.400" },
  info: { icon: <LuInfo />, color: "blue.400" },
};

// Tampilan semua toast di aplikasi, dipasang sekali lewat toastOptions di
// ChakraProvider, jadi pemanggil toast({ ... }) tidak perlu diubah.
// Kartu ringkas yang ikut tema, bukan blok warna penuh bawaan Chakra.
const AppToast = ({
  title,
  description,
  status = "info",
  isClosable,
  onClose,
}: {
  title?: ReactNode;
  description?: ReactNode;
  status?: AlertStatus;
  isClosable?: boolean;
  onClose: () => void;
}) => {
  const meta = status === "loading" ? null : STATUS[status];

  return (
    // Tanpa role sendiri: Chakra sudah membungkus toast dengan role="status",
    // dan role bersarang membuat pembaca layar membacakannya dua kali.
    <Flex
      alignItems="flex-start"
      gap="3"
      mt="2"
      mx="3"
      px="4"
      py="3"
      w={{ base: "calc(100vw - 24px)", sm: "360px" }}
      maxW="100%"
      bg="app.card"
      color="app.text"
      rounded="xl"
      border="1px"
      borderColor="app.border"
      boxShadow="lg"
    >
      {meta ? (
        <Circle size="22px" mt="0.5" bg={meta.color} color="white" fontSize="xs" flexShrink={0}>
          {meta.icon}
        </Circle>
      ) : (
        <Spinner size="sm" mt="1" color="green.500" flexShrink={0} />
      )}

      <Box flex="1" minW="0">
        {title && (
          <Text fontSize="sm" fontWeight="semibold" lineHeight="short">
            {title}
          </Text>
        )}
        {description && (
          <Text mt="0.5" fontSize="xs" color="app.textMuted">
            {description}
          </Text>
        )}
      </Box>

      {isClosable && (
        <CloseButton
          size="sm"
          mt="-1"
          mr="-2"
          rounded="full"
          color="app.textMuted"
          _hover={{ bg: "app.hover", color: "app.text" }}
          onClick={onClose}
        />
      )}
    </Flex>
  );
};

export default AppToast;
