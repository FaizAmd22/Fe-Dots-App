/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Avatar,
  Input,
  Flex,
  Button,
  InputGroup,
  InputLeftElement,
  Image,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API } from "../libs/axios";
import { IoCloseCircle } from "react-icons/io5";
import { BiSolidImageAdd } from "react-icons/bi";
import { selectUser } from "../slices/userSlice";
import { useThreadsHooks } from "../hooks/threads";
import { useDetailThreadHooks } from "../hooks/detailThread";
import { setIsFetchDetail } from "../slices/detailThreadSlice";

interface IType {
  id?: number;
  type: string;
}

// Batas jumlah gambar; sama dengan MAX_IMAGES di backend.
const MAX_IMAGES = 4;

interface inputData {
  content: string | null;
  images: File[];
}

const CreatePost = (type: IType) => {
  const user = useSelector(selectUser);
  const toast = useToast();
  const token = sessionStorage.getItem("token");
  const dispatch = useDispatch();
  const { fetchThreadAuth } = useThreadsHooks();
  const { fetchDetailAuth } = useDetailThreadHooks();

  // console.log("token :", token);
  console.log("types :", type);

  const [formData, setFormData] = useState<inputData>({
    content: type.type == "threads" ? null : "",
    images: [],
  });

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files.length > 0) {
      const picked = Array.from(files) as File[];

      setFormData((prevData) => {
        const merged = [...prevData.images, ...picked].slice(0, MAX_IMAGES);

        if (prevData.images.length + picked.length > MAX_IMAGES) {
          toast({
            position: "top",
            title: `Maksimal ${MAX_IMAGES} gambar.`,
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
        }

        return { ...prevData, images: merged };
      });

      // Input direset supaya memilih berkas yang sama lagi tetap memicu onChange.
      e.target.value = "";
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
    // Klik kedua ditolak selagi yang pertama masih terkirim — dulu klik ganda
    // menghasilkan dua thread yang sama.
    if (isPosting) return;

    if (
      (formData.content == null || !formData.content) &&
      !formData.images.length
    ) {
      return toast({
        position: "top",
        title: "Data can't be empty!",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }

    // Harus FormData sungguhan: beberapa gambar dikirim dengan nama field yang
    // sama ("image"), dan objek biasa tidak bisa menyatakan hal itu.
    const body = new FormData();
    if (formData.content) body.append("content", formData.content);
    formData.images.forEach((image) => body.append("image", image));

    const isThread = type.type == "threads";

    // Tombol menampilkan spinner selama request berjalan. Dulu toast "Please
    // wait" baru muncul SETELAH request selesai (lewat timer palsu 700 ms),
    // jadi selama upload berlangsung layar benar-benar diam.
    setIsPosting(true);
    try {
      await API.post(isThread ? "/thread" : `/thread/${type.id}/reply`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({ content: "", images: [] });

      toast({
        position: "top",
        title: isThread ? "Thread Posted" : "Reply Posted",
        description: isThread
          ? "Your thread has been posted successfully!"
          : "Your reply has been posted successfully!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      fetchThreadAuth();
      fetchDetailAuth();
      dispatch(setIsFetchDetail(true));
    } catch (error) {
      toast({
        position: "top",
        title: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something error while post!",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Box color="white" pb="2">
      {/* Flex, bukan grid 13 kolom: di HP satu kolom grid cuma ~27px, jadi
          avatar, ikon gambar, dan tombol Post saling berdesakan dan input
          teksnya terpotong. Sekarang hanya input yang melebar/menyempit. */}
      <Flex alignItems="center" gap={{ base: "2", md: "3" }}>
        <Avatar
          src={
            user.picture
              ? user.picture
              : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
          }
          name={user.name}
          w={{ base: "40px", md: "50px" }}
          h={{ base: "40px", md: "50px" }}
          flexShrink={0}
        />

        <Input
          flex="1"
          minW="0"
          px={{ base: "2", md: "4" }}
          onChange={handleChange}
          value={formData.content!}
          type="text"
          border="none"
          name="content"
          focusBorderColor="none"
          placeholder={
            type.type == "replies" ? "Type your reply!" : "What is happening?!"
          }
        />

        <InputGroup
          w="40px"
          h="40px"
          flexShrink={0}
          fontSize="3xl"
          color="green.500"
          _hover={{ color: "white" }}
        >
          <InputLeftElement pointerEvents="none" fontSize="3xl" h="40px" w="40px">
            <BiSolidImageAdd />
          </InputLeftElement>

          <Input
            opacity="0"
            type="file"
            name="image"
            accept="image/*"
            multiple
            h="40px"
            w="40px"
            p="0"
            cursor="pointer"
            aria-label="Tambah gambar"
            onChange={handleChange}
          />
        </InputGroup>

        <Button
          size={{ base: "sm", md: "md" }}
          px={{ base: "5", md: "7" }}
          flexShrink={0}
          color="white"
          bg="green.500"
          borderRadius="full"
          _hover={{ color: "green.500", bg: "white" }}
          isLoading={isPosting}
          onClick={handleSubmit}
        >
          Post
        </Button>
      </Flex>

      {formData.images.length > 0 && (
        // Sejajar dengan input teks, di sebelah kanan avatar.
        <Box pl={{ base: "48px", md: "62px" }} pt="3">
          <Flex gap="3" flexWrap="wrap">
            {formData.images.map((image, index) => (
              <Box key={index} position="relative">
                <IconButton
                  icon={<IoCloseCircle />}
                  position="absolute"
                  top="-10px"
                  right="-10px"
                  zIndex="1"
                  bg="none"
                  isRound={true}
                  variant="solid"
                  color="red.600"
                  fontSize="24px"
                  _hover={{ bg: "none", color: "white" }}
                  aria-label="Hapus gambar"
                  onClick={() =>
                    setFormData((prevData) => ({
                      ...prevData,
                      images: prevData.images.filter((_, i) => i !== index),
                    }))
                  }
                />

                <Image
                  src={URL.createObjectURL(image)}
                  h="50px"
                  w="50px"
                  objectFit="cover"
                  rounded="md"
                />
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default CreatePost;
