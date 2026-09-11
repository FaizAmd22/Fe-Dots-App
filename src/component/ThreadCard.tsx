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
import changeFormatDate from "../features/ChangeFormatDate";
import Dropdown from "../features/Dropdown";
import Liked from "../features/Liked";
import { Link } from "react-router-dom";
import { darkenOnHover } from "../features/HoverStyles";
import ImageViewer from "../features/ImageViewer";
import ImageGrid from "../features/ImageGrid";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { useProfileHooks } from "../hooks/profile";
import { useProfileThreadHooks } from "../hooks/profileThread";

const ThreadCard = (thread: any) => {
  const { fetchProfile } = useProfileHooks();
  const { fetchProfileThread, fetchProfileThreadAuth } = useProfileThreadHooks();

  const {
    author,
    content,
    created_at,
    id,
    image,
    isLike,
    likes,
    likedPerson,
    replies,
  } = thread.thread;

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

  const imageList: string[] = thread.thread.images?.length
    ? thread.thread.images
    : image
    ? [image]
    : [];

  const handleClick = () => {
    // dispatch(setIsFetchDetail(true))
    fetchProfile();
    fetchProfileThread();
    fetchProfileThreadAuth();
    sessionStorage.setItem("profile", JSON.stringify(author));
  };

  return (
    <Box w="100%" color="app.text" borderTop="1px" py="5" borderColor="app.border">
      <ImageViewer
        isOpen={isImageOpen}
        onClose={onImageClose}
        images={imageList}
        startIndex={imageStartIndex}
        author={author}
        createdAt={created_at}
      />

      <Grid templateColumns="repeat(13, 1fr)">
        <GridItem w="50px" mr="2" color="app.text" borderRadius="full">
          <Link to={`/profile/${author.username}`} onClick={handleClick}>
            <Avatar
              src={
                author.picture
                  ? author.picture
                  : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
              }
              name={author.name}
              {...darkenOnHover}
            />
          </Link>
        </GridItem>

        <GridItem colSpan={12}>
          <Flex alignItems="center" alignContent="center">
            <Box>
              <Flex gap="1" color="app.text" alignItems="center" h="22px">
                <Link to={`/profile/${author.username}`} onClick={handleClick}>
                  <Text fontWeight="semibold" {...darkenOnHover}>
                    {author.name}
                  </Text>
                </Link>

                <Link to={`/profile/${author.username}`} onClick={handleClick}>
                  <Text
                    ml="1"
                    color="gray.500"
                    textDecoration="underline"
                    {...darkenOnHover}
                  >
                    @{author.username}
                  </Text>
                </Link>

                <Text ml="3" fontSize="sm" color="gray.500">
                  {changeFormatDate(created_at)}
                </Text>
              </Flex>
            </Box>

            <Spacer />

            <Dropdown
              id={id}
              type="threads"
              userId={author.id}
              content={content}
              images={imageList}
            />
          </Flex>

          <Link to={`/details/${id}`}>
            <Box>
              <Text fontSize="sm" my="2" mb="4">
                {content}
              </Text>

              <ImageGrid images={imageList} onOpen={openImageAt} py="4" />
            </Box>
          </Link>

          <Flex gap="1">
            <Flex gap="2">
              <Liked
                liked={likes}
                id={id}
                isLiked={isLike}
                likedPerson={likedPerson}
                type="threads"
              />
            </Flex>

            <Text
              px="7"
              bg="none"
              fontSize="xl"
              color="gray.500"
              borderRadius="full"
              _hover={{ color: "app.textHover" }}
            >
              <Link to={`/details/${id}`}>
                <Flex>
                  <Center gap="2" fontSize="2xl">
                    <BiCommentDetail />

                    <Text fontSize="md">{replies} Replies</Text>
                  </Center>
                </Flex>
              </Link>
            </Text>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
    //   <Text>testtt</Text>
  );
};

export default ThreadCard;
