/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  IconButton,
} from "@chakra-ui/react";
import { MdEdit } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import AlertDelete from "./AlertDelete";
import EditPostModal from "./EditPostModal";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";

// Berapa lama teks "Link Copied" bertahan sebelum kembali normal.
const FEEDBACK_MS = 2000;

const Dropdown = (data: any) => {
  const userId = sessionStorage.getItem("id");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const timerRef = useRef<number | null>(null);

  // Tanpa ini, komponen yang keburu di-unmount (misalnya thread-nya dihapus)
  // masih akan diubah state-nya saat timer berbunyi.
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const showFeedback = (state: "copied" | "error") => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setCopyState(state);
    timerRef.current = window.setTimeout(() => setCopyState("idle"), FEEDBACK_MS);
  };

  const handleShare = async () => {
    // window.location.origin, bukan URL yang di-hardcode: sebelumnya tautan dari
    // halaman profil selalu menunjuk ke localhost:5173, jadi tidak bisa dibuka
    // siapa pun setelah di-deploy.
    const url = `${window.location.origin}/details/${data.id}`;

    try {
      await navigator.clipboard.writeText(url);
      showFeedback("copied");
    } catch (error) {
      showFeedback("error");
    }
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<BsThreeDotsVertical />}
        variant="none"
        borderColor="#1D1D1D"
      />
      <MenuList bg="#1D1D1D">
        {/* closeOnSelect dimatikan supaya menunya tidak langsung tertutup —
            kalau tertutup, perubahan teksnya tidak sempat terlihat. */}
        <MenuItem
          icon={copyState === "copied" ? <LuCheck /> : <LuCopy />}
          bg="#1D1D1D"
          color={copyState === "error" ? "red.400" : undefined}
          closeOnSelect={false}
          onClick={handleShare}
        >
          {copyState === "copied"
            ? "Link Copied"
            : copyState === "error"
            ? "Gagal menyalin"
            : "Copy Link"}
        </MenuItem>
        {data.userId == userId && (
          <>
            <MenuItem icon={<MdEdit />} bg="#1D1D1D" onClick={onEditOpen}>
              Edit
            </MenuItem>

            {/* Dirender sebagai komponen, BUKAN dipanggil sebagai fungsi.
                AlertDelete memakai beberapa hook; kalau dipanggil langsung,
                hook-hook itu masuk ke hitungan milik Dropdown. Karena blok ini
                kondisional (hanya untuk konten sendiri), jumlah hook Dropdown
                jadi berubah-ubah antar render dan React membuang seluruh pohon
                komponen — layar berubah putih. */}
            <MenuItem bg="#1D1D1D">
              <AlertDelete {...data} />
            </MenuItem>
          </>
        )}
      </MenuList>

      <EditPostModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        id={data.id}
        type={data.type}
        content={data.content}
        images={data.images}
      />
    </Menu>
  );
};

export default Dropdown;
