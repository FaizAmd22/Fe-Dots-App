/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  Avatar,
  Spacer,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { darkenOnHover } from "../../features/HoverStyles";
import ImageViewer from "../../features/ImageViewer";
import ImageGrid from "../../features/ImageGrid";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import changeFormatDate from "../../features/ChangeFormatDate";
import Dropdown from "../../features/Dropdown";
import Liked from "../../features/Liked";
import { useProfileHooks } from "../../hooks/profile";
import { useProfileThreadHooks } from "../../hooks/profileThread";
import { useTranslation } from "../../i18n/useTranslation";

const ReplyCards = (reply: any) => {
  const { t } = useTranslation();
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

  const imageList: string[] = reply.reply.images?.length
    ? reply.reply.images
    : reply.reply.image
    ? [reply.reply.image]
    : [];

  const { fetchProfile } = useProfileHooks();
  const { fetchProfileThread, fetchProfileThreadAuth } = useProfileThreadHooks();
  const handleClick = () => {
    fetchProfile();
    fetchProfileThread();
    fetchProfileThreadAuth();
  };

  return (
    <Box
      w="100%"
      py="5"
      color="app.text"
      borderTop="1px"
      borderColor="app.border"
    >
      <Grid templateColumns="repeat(13, 1fr)">
        <Link
          to={`/profile/${reply.reply.author.username}`}
          onClick={handleClick}
        >
          <GridItem w="50px" mr="2" borderRadius="full" color="app.text">
            <Avatar
              src={
                reply.reply.author.picture
                  ? reply.reply.author.picture
                  : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
              }
              name={reply.reply.author.name}
              {...darkenOnHover}
            />
          </GridItem>
        </Link>

        <GridItem colSpan={12}>
          <Flex alignItems="center" alignContent="center">
            <Box>
              <Flex gap="1" color="app.text" alignItems="center" h="22px">
                <Link
                  to={`/profile/${reply.reply.author.username}`}
                  onClick={handleClick}
                >
                  <Text fontWeight="semibold" {...darkenOnHover}>
                    {reply.reply.author.name}
                  </Text>
                </Link>

                <Link
                  to={`/profile/${reply.reply.author.username}`}
                  onClick={handleClick}
                >
                  <Text
                    ml="1"
                    color="gray.500"
                    textDecoration="underline"
                    {...darkenOnHover}
                  >
                    @{reply.reply.author.username}
                  </Text>
                </Link>

                <Text ml="3" fontSize="sm" color="gray.500">
                  {changeFormatDate(reply.reply.created_at, t)}
                </Text>

                <Dropdown
                  id={reply.reply.id}
                  type="replies"
                  userId={reply.reply.author.id}
                  content={reply.reply.content}
                  images={imageList}
                />
              </Flex>

              <Text fontSize="sm" mt="2" mb="4">
                {reply.reply.content}
              </Text>
            </Box>

            <Spacer />

            <Box pr={{ base: "2", md: "0", xl: "5" }}>
              <Liked
                liked={reply.reply.likes}
                id={reply.reply.id}
                isLiked={reply.reply.isLike}
                type="replies"
              />
            </Box>
          </Flex>
          <Box>
            <ImageGrid
              images={imageList}
              onOpen={openImageAt}
              pt="2"
              pr={{ base: "4", md: "2", xl: "7" }}
            />

            <ImageViewer
              isOpen={isImageOpen}
              onClose={onImageClose}
              images={imageList}
              startIndex={imageStartIndex}
              author={reply.reply.author}
              createdAt={reply.reply.created_at}
            />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ReplyCards;
