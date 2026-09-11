/* eslint-disable @typescript-eslint/no-explicit-any */
import { Flex, Text, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { API } from "../libs/axios";
import Swal from "sweetalert2";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useThreadsHooks } from "../hooks/threads";
import { useProfileThreadHooks } from "../hooks/profileThread";
import { useDetailThreadHooks } from "../hooks/detailThread";
import { swalTheme } from "./swalTheme";

const Liked = (likes: any) => {
  const { fetchThreadAuth } = useThreadsHooks();
  const { fetchDetailAuth } = useDetailThreadHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();
  const currentUrl = window.location.href;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const id = likes.id;

  // Status dipegang lokal supaya hati dan angkanya berubah seketika saat diklik,
  // tanpa menunggu request selesai. Sebelumnya perubahan baru terlihat setelah
  // POST like DAN seluruh feed selesai diambil ulang.
  const [isLiked, setIsLiked] = useState<boolean>(likes.isLiked);
  const [count, setCount] = useState<number>(likes.liked || 0);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Ikuti nilai dari server saat datanya dimuat ulang.
  useEffect(() => {
    setIsLiked(likes.isLiked);
    setCount(likes.liked || 0);
  }, [likes.isLiked, likes.liked]);

  const handleLiked = async () => {
    if (!token) {
      Swal.fire({
        title: "You need to login first!",
        text: "Do you wanna login?",
        ...swalTheme(),
        showCancelButton: true,
        confirmButtonText: "Yes",
        reverseButtons: true,
      }).then((result: any) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }

    if (isPending) return;

    const next = !isLiked;
    setIsLiked(next);
    setCount((current) => current + (next ? 1 : -1));
    setIsPending(true);

    try {
      const url =
        likes.type == "threads" ? `/thread/${id}/like` : `/reply/${id}/like`;

      await API.post(url, "", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // Gagal di server: kembalikan tampilan ke keadaan semula.
      setIsLiked(!next);
      setCount((current) => current + (next ? -1 : 1));
      setIsPending(false);
      return;
    }

    setIsPending(false);

    // Penyegaran dijalankan di belakang, tidak ditunggu satu per satu.
    // Dulu keempatnya di-await berderet sehingga satu klik menunggu lebih dari
    // tiga detik, padahal hasilnya sudah terlihat sejak awal.
    fetchThreadAuth();
    if (currentUrl.includes("profile")) fetchProfileThreadAuth();
    if (currentUrl.includes("details")) fetchDetailAuth();
  };

  return (
    <Flex gap="2">
      <Link
        px="0"
        bg="none"
        fontSize="2xl"
        color="gray.500"
        _hover={{ color: "app.textHover" }}
        onClick={handleLiked}
      >
        {isLiked ? (
          <Text color="red.500">
            <FaHeart />
          </Text>
        ) : (
          <FaRegHeart />
        )}
      </Link>

      <Text color="gray.500" fontSize="md">
        {count}
      </Text>
    </Flex>
  );
};

export default Liked;
