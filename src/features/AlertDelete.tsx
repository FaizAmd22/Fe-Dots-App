/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuItem, useToast } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";
import { API } from "../libs/axios";
import { useThreadsHooks } from "../hooks/threads";
import { useProfileThreadHooks } from "../hooks/profileThread";
import { useDetailThreadHooks } from "../hooks/detailThread";
import { useTranslation } from "../i18n/useTranslation";
import { useConfirm } from "../component/feedback/useConfirm";

// Item "Hapus" di menu opsi thread/reply. Dulu berupa tombol merah besar di
// dalam menu dengan dialognya sendiri; sekarang item menu biasa yang memakai
// dialog konfirmasi bersama, dengan spinner selama request berjalan.
export default function AlertDelete(data: any) {
  const toast = useToast();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const token = sessionStorage.getItem("token");
  const { fetchDetailAuth } = useDetailThreadHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();
  const { fetchThreadAuth } = useThreadsHooks();
  const isThread = data.type == "threads";

  const deletePost = async () => {
    try {
      await API.delete(isThread ? `/thread/${data.id}` : `/reply/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchDetailAuth();
      fetchThreadAuth();
      fetchProfileThreadAuth();
      toast({ title: t("post.deleteSuccess"), status: "success", duration: 1500, isClosable: true });

      if (window.location.href.includes("details") && isThread) {
        window.history.back();
      }
    } catch (error) {
      toast({ title: t("post.noPermission"), status: "error", duration: 2000, isClosable: true });
    }
  };

  const handleClick = () =>
    confirm({
      title: isThread ? t("post.deleteThreadTitle") : t("post.deleteReplyTitle"),
      description: t("post.deleteConfirm"),
      confirmText: t("common.delete"),
      tone: "danger",
      icon: <LuTrash2 />,
      onConfirm: deletePost,
    });

  return (
    <MenuItem
      icon={<LuTrash2 />}
      color="red.400"
      bg="transparent"
      _hover={{ bg: "app.hover" }}
      _focus={{ bg: "app.hover" }}
      onClick={handleClick}
    >
      {t("common.delete")}
    </MenuItem>
  );
}
