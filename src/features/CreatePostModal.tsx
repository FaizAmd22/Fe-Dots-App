/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Input,
  Spacer,
  Avatar,
  InputGroup,
  InputLeftElement,
  Box,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../libs/axios";
import { BiSolidImageAdd } from "react-icons/bi";
import { IoCloseCircle } from "react-icons/io5";
import { selectUser } from "../slices/userSlice";
import { useThreadsHooks } from "../hooks/threads";
import { useProfileThreadHooks } from "../hooks/profileThread";
import { useTranslation } from "../i18n/useTranslation";

const CreatePostModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = useSelector(selectUser);
  const toast = useToast();
  const { t } = useTranslation();
  const token = sessionStorage.getItem("token");
  const { fetchThreadAuth } = useThreadsHooks();
  const { fetchProfileThreadAuth } = useProfileThreadHooks();
  // console.log("token :", token);
  // console.log("types :", type);

  const [formData, setFormData] = useState({
    content: null,
    image: null,
  });

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files.length > 0) {
      const selectedImage = files[0];
      // console.log("set Image :", selectedImage);

      setFormData((prevData) => ({
        ...prevData,
        image: selectedImage,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    if (formData.content == "") {
      setFormData((prevData) => ({
        ...prevData,
        content: null,
      }));
    }
  };
  console.log("formDatra :", formData);

  const [isPosting, setIsPosting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (isPosting) return;

    if (formData.content == null && formData.image == null) {
      return toast({
        position: "top",
        title: t("common.emptyContent"),
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }

    setIsPosting(true);
    try {
      await API.post("/thread", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        position: "top",
        title: t("post.threadPosted"),
        description: t("post.threadPostedDesc"),
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      // Input di modal ini tidak terkontrol, jadi tanpa pengosongan ini isi
      // lama tetap tersimpan dan ikut terkirim lagi saat modal dibuka ulang.
      setFormData({ content: null, image: null });
      onClose();

      fetchThreadAuth();
      fetchProfileThreadAuth();
    } catch (error) {
      toast({
        position: "top",
        title: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t("post.postFailed"),
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        w="100%"
        margin="auto"
        color="white"
        bg="green.500"
        rounded="full"
        fontSize="14px"
        fontWeight="semibold"
        display={{ base: "none", md: "block" }}
        _hover={{ bg: "app.inverse", color: "green.500", boxShadow: "lg" }}
      >
        {t("nav.createPost")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent
          maxW="600px"
          py="4"
          mx="2"
          bg="app.bg"
          color="app.text"
          textAlign="center"
        >
          <ModalCloseButton />

          <ModalBody py="16" pt="4">
            <Flex margin="auto" gap={5}>
              <Avatar
                src={
                  user.picture
                    ? user.picture
                    : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
                }
              />

              <Input
                focusBorderColor="none"
                placeholder={t("post.placeholderThread")}
                type="text"
                border="none"
                name="content"
                onChange={handleChange}
              />
            </Flex>
          </ModalBody>

          <Flex px="10" mt="1" mb="4">
            <InputGroup
              w="50px"
              h="100%"
              fontSize="3xl"
              color="green.500"
              _hover={{ color: "app.text" }}
            >
              <InputLeftElement pointerEvents="none" fontSize="3xl">
                <BiSolidImageAdd />
              </InputLeftElement>

              <Input
                opacity="0"
                type="file"
                name="image"
                onChange={handleChange}
              />
            </InputGroup>

            <Spacer />

            <Button
              px="6"
              py="1"
              color="white"
              rounded="full"
              bg="green.500"
              _hover={{ bg: "app.inverse", color: "green.500", boxShadow: "lg" }}
              isLoading={isPosting}
              onClick={handleSubmit}
            >
              {t("post.submit")}
            </Button>
          </Flex>
          <Box>
            {formData.image && (
              <>
                <IconButton
                  icon={<IoCloseCircle />}
                  ml="-20px"
                  mb="-20px"
                  bg="none"
                  isRound={true}
                  variant="solid"
                  color="red.600"
                  fontSize="28px"
                  _hover={{ bg: "none", color: "app.text" }}
                  onClick={() =>
                    setFormData((prevData) => ({
                      ...prevData,
                      image: null,
                    }))
                  }
                  aria-label={t("common.removeImage")}
                />

                {/* <Image src={URL.createObjectURL(formData.image)} h="120px" /> */}
                <Avatar src={URL.createObjectURL(formData.image)} size="2xl" />
              </>
            )}
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePostModal;
