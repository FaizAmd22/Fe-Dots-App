/* eslint-disable @typescript-eslint/no-explicit-any */
import { Flex, Text, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { API } from "../libs/axios";
import Swal from "sweetalert2";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { useThreadsHooks } from "../hooks/threads";
import { useProfileThreadHooks } from "../hooks/profileThread";
import { useDetailThreadHooks } from "../hooks/detailThread";

const Liked = (likes: any) => {
  const { fetchThreadAuth } = useThreadsHooks();
  const { fetchDetailAuth } = useDetailThreadHooks();
  const {  fetchProfileThreadAuth } =
    useProfileThreadHooks();
  const currentUrl = window.location.href;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const id = likes.id;
  const test = "";

  const fetchLike = async () => {
    let response

    if (likes.type == "threads") {
      response = await API.post(`/thread/${id}/like`, test, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      response = await API.post(`/reply/${id}/like`, test, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return response.data
  };
  const handleLiked = async () => {
    if (!token) {
      Swal.fire({
        title: "You need to login first!",
        text: "Do you wanna login?",
        background: "#2b2b2b",
        color: "white",
        showCancelButton: true,
        confirmButtonText: "Yes",
        reverseButtons: true,
      }).then((result: any) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else {
      await fetchLike();
      await fetchThreadAuth();
      await fetchProfileThreadAuth();
      if (currentUrl.includes("details")) {
        await fetchDetailAuth();
      }
    }
  };

  return (
    <Flex gap="2">
      <Link
        px="0"
        bg="none"
        fontSize="2xl"
        color="gray.500"
        _hover={{ color: "gray.200" }}
        onClick={handleLiked}
      >
        {likes.isLiked ? (
          <Text color="red.500">
            <FaHeart />
          </Text>
        ) : (
          <FaRegHeart />
        )}
      </Link>

      <Text color="gray.500" fontSize="md">
        {likes.liked}
      </Text>
    </Flex>
  );
};

export default Liked;
