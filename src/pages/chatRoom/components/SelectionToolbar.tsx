import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuForward, LuTrash2, LuX } from "react-icons/lu";
import Swal from "sweetalert2";
import { swalTheme } from "../../../features/swalTheme";
import { useTranslation } from "../../../i18n/useTranslation";

const SelectionToolbar = ({
  count,
  canDeleteForEveryone,
  onCancel,
  onForward,
  onDelete,
}: {
  count: number;
  canDeleteForEveryone: boolean;
  onCancel: () => void;
  onForward: () => void;
  onDelete: (scope: "me" | "everyone") => Promise<void>;
}) => {
  const toast = useToast();
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const confirmDelete = async (scope: "me" | "everyone") => {
    const confirmation = await Swal.fire({
      title:
        scope === "everyone"
          ? t("chat.deleteForEveryoneTitle")
          : t("chat.deleteForMeTitle"),
      text:
        scope === "everyone"
          ? t("chat.deleteForEveryoneText", { count })
          : t("chat.deleteForMeText", { count }),
      icon: "warning",
      ...swalTheme(),
      showCancelButton: true,
      confirmButtonText: t("chat.deleteConfirm"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(scope);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("chat.deleteFailed");
      toast({
        position: "top",
        title: message,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Flex alignItems="center" gap="2" py={{ base: "2", md: "4" }}>
      <IconButton
        size="sm"
        bg="none"
        color="app.text"
        rounded="full"
        aria-label={t("chat.cancelSelection")}
        icon={<LuX />}
        _hover={{ bg: "app.card" }}
        onClick={onCancel}
      />

      <Text fontSize="md" fontWeight="semibold">
        {t("chat.selected", { count })}
      </Text>

      <Spacer />

      <Button
        size="sm"
        bg="none"
        color="app.text"
        rounded="full"
        leftIcon={<LuForward />}
        _hover={{ bg: "app.card" }}
        onClick={onForward}
      >
        {t("chat.forward")}
      </Button>

      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          bg="none"
          color="red.400"
          rounded="full"
          leftIcon={<LuTrash2 />}
          isLoading={isDeleting}
          _hover={{ bg: "app.card" }}
        >
          {t("common.delete")}
        </MenuButton>

        <MenuList bg="app.card" borderColor="app.borderMenu">
          <MenuItem
            bg="app.card"
            _hover={{ bg: "app.cardHover" }}
            onClick={() => confirmDelete("me")}
          >
            {t("chat.deleteForMe")}
          </MenuItem>

          {/* Hanya pesan sendiri yang bisa ditarik dari layar orang lain. */}
          {canDeleteForEveryone && (
            <MenuItem
              bg="app.card"
              color="red.400"
              _hover={{ bg: "app.cardHover" }}
              onClick={() => confirmDelete("everyone")}
            >
              {t("chat.deleteForEveryone")}
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default SelectionToolbar;
