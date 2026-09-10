/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  Center,
  Avatar,
  Spacer,
} from "@chakra-ui/react";
import { BiCommentDetail } from "react-icons/bi";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { darkenOnHover } from "../../../features/HoverStyles";
import ImageViewer from "../../../features/ImageViewer";
import ImageGrid from "../../../features/ImageGrid";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { selectDetailThread } from "../../../slices/detailThreadSlice";
import { useProfileThreadHooks } from "../../../hooks/profileThread";
import Dropdown from "../../../features/Dropdown";
import Liked from "../../../features/Liked";
import CreatePost from "../../../features/CreatePost";
import ReplyCards from "../../reply/ReplyCards";
import { useProfileHooks } from "../../../hooks/profile";

const DetailThreadCards = () => {
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();
  const [imageStartIndex, setImageStartIndex] = useState<number>(0);

  const openImageAt = (index: number) => {
    setImageStartIndex(index);
    onImageOpen();
  };

  // const [data, setData] = useState<any>({});
  const data = useSelector(selectDetailThread);
  const imageList: string[] = data.images?.length
    ? data.images
    : data.image
    ? [data.image]
    : [];

  const formatedDate = new Date(data.created_at);
  const date = formatedDate.toDateString();
  const token = sessionStorage.getItem("token");
  const { fetchProfile } = useProfileHooks();
  const { fetchProfileThread, fetchProfileThreadAuth } =
    useProfileThreadHooks();

  const handleClick = () => {
    // dispatch(setIsFetchDetail(true))
    fetchProfile();
    fetchProfileThread();
    fetchProfileThreadAuth();
  };

  // Thread bisa belum termuat, gagal dimuat, atau baru saja dihapus. Tanpa
  // penjaga ini, data.author yang undefined membuat render gagal dan seluruh
  // halaman berubah jadi putih kosong.
  if (!data?.id || !data?.author) {
    return (
      <Box w="100%" color="gray.500" textAlign="center" py="20">
        <Text>Thread tidak ditemukan atau sudah dihapus.</Text>
      </Box>
    );
  }

  return (
    <>
      <Box w="100%" color="white">
        <Box py="5">
          <Grid templateColumns="repeat(13, 1fr)">
            <GridItem w="50px" mr="2" color="white" borderRadius="full">
              <NavLink
                to={`/profile/${data.author.username}`}
                onClick={handleClick}
              >
                <Avatar
                  src={
                    data.author.picture
                      ? data.author.picture
                      : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
                  }
                  name={data.author.name}
                  {...darkenOnHover}
                />
              </NavLink>
            </GridItem>

            <GridItem colSpan={12}>
              <Flex>
                <Flex gap="1" color="gray.500" flexDirection="column">
                  <NavLink
                    to={`/profile/${data.author.username}`}
                    onClick={handleClick}
                  >
                    <Text
                      fontWeight="semibold"
                      color="white"
                      {...darkenOnHover}
                    >
                      {data.author.name}
                    </Text>
                  </NavLink>

                  <NavLink
                    to={`/profile/${data.author.username}`}
                    onClick={handleClick}
                  >
                    <Text mt="-1" textDecoration="underline" {...darkenOnHover}>
                      @{data.author.username}
                    </Text>
                  </NavLink>
                </Flex>

                <Spacer />

                <Dropdown
                  id={data.id}
                  type="threads"
                  userId={data.author.id}
                  content={data.content}
                  images={imageList}
                />
              </Flex>
            </GridItem>
          </Grid>

          <Text fontSize="sm" mt="5">
            {data.content}
          </Text>

          <ImageGrid images={imageList} onOpen={openImageAt} py="4" />

          <ImageViewer
            isOpen={isImageOpen}
            onClose={onImageClose}
            images={imageList}
            startIndex={imageStartIndex}
            author={data.author}
            createdAt={data.created_at}
          />

          <Text pb="4" color="gray.500" fontSize="sm">
            {date}
          </Text>

          <Flex gap="1">
            <Flex gap="2">
              <Liked
                liked={data.likes}
                id={data.id}
                isLiked={data.isLike}
                type="threads"
              />
            </Flex>

            <Text
              px="7"
              bg="none"
              fontSize="xl"
              color="gray.500"
              borderRadius="full"
              _hover={{ color: "gray.200" }}
            >
              <Flex>
                <Center gap="2">
                  <BiCommentDetail />

                  <Text fontSize="sm">{data.replies} Replies</Text>
                </Center>
              </Flex>
            </Text>
          </Flex>
        </Box>

        <Box py="5" borderTop="1px" borderColor="gray.600">
          {token && <CreatePost id={data.id} type="replies" />}
        </Box>

        {!token
          ? data.reply.map((replies: any, index: number) => {
              return (
                <ReplyCards
                  key={replies.id}
                  reply={replies}
                  index={index}
                  type="replies"
                />
              );
            })
          : data.reply.data.map((replies: any, index: number) => {
              return (
                <ReplyCards
                  key={replies.id}
                  reply={replies}
                  index={index}
                  type="replies"
                />
              );
            })}
      </Box>
    </>
  );
};

export default DetailThreadCards;
