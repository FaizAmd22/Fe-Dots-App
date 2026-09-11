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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const confirmDelete = async (scope: "me" | "everyone") => {
    const confirmation = await Swal.fire({
      title: scope === "everyone" ? "Hapus untuk semua?" : "Hapus untuk saya?",
      text:
        scope === "everyone"
          ? `${count} pesan akan hilang juga dari layar lawan bicara dan tidak bisa dikembalikan.`
          : `${count} pesan hanya hilang dari layarmu; lawan bicara tetap melihatnya.`,
      icon: "warning",
      ...swalTheme(),
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(scope);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal menghapus pesan!";
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
        aria-label="Batalkan pilihan"
        icon={<LuX />}
        _hover={{ bg: "app.card" }}
        onClick={onCancel}
      />

      <Text fontSize="md" fontWeight="semibold">
        {count} dipilih
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
        Teruskan
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
          Hapus
        </MenuButton>

        <MenuList bg="app.card" borderColor="app.borderMenu">
          <MenuItem
            bg="app.card"
            _hover={{ bg: "app.cardHover" }}
            onClick={() => confirmDelete("me")}
          >
            Hapus untuk saya
          </MenuItem>

          {/* Hanya pesan sendiri yang bisa ditarik dari layar orang lain. */}
          {canDeleteForEveryone && (
            <MenuItem
              bg="app.card"
              color="red.400"
              _hover={{ bg: "app.cardHover" }}
              onClick={() => confirmDelete("everyone")}
            >
              Hapus untuk semua
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default SelectionToolbar;
