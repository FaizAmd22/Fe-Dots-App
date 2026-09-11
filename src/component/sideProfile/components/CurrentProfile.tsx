import {
  Text,
  Box,
  Stack,
  Avatar,
  Center,
  Flex,
  Image,
  Link,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { selectUser } from "../../../slices/userSlice";
import EditProfileModal from "../../../features/EditProfileModal";
import { useTranslation } from "../../../i18n/useTranslation";

const CurrentProfile = () => {
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  // console.log("user di current:", user);
  const { name, username, bio, cover_photo, follower, following, picture } =
    user;

  // console.log("following :", following);
  // console.log("follower :", follower);

  return (
    <Stack gap="2">
      <Text color="app.onSurface" fontWeight="semibold" fontSize="xl">
        {t("profile.myProfile")}
      </Text>

      <Box w="100%" h="150px" rounded="lg">
        <Image
          src={
            cover_photo
              ? cover_photo
              : "https://wallpapers.com/images/high/blue-gradient-background-gu71dwd19no9ra2v.webp"
          }
          w="100%"
          h="150px"
          rounded="lg"
          objectFit="cover"
        />
      </Box>

      {/* Flex, bukan grid 5 kolom: tombol Edit Profile dulu menempati satu
          kolom grid (~50px) sehingga tertarik jadi lingkaran kecil dengan
          teks meluber. Sekarang lebarnya mengikuti teks. */}
      <Flex justifyContent="space-between" alignItems="flex-end" gap="2">
        <Center
          w="115px"
          h="115px"
          mt="-70px"
          ml="4"
          bg="app.surface"
          borderRadius="full"
          flexShrink={0}
        >
          <Avatar
            src={
              picture
                ? picture
                : "https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg"
            }
            //   alt="picture"
            w="100px"
            h="100px"
            objectFit="cover"
          />
        </Center>

        <EditProfileModal />
      </Flex>

      <Stack gap="1">
        <Flex color="app.onSurface" fontSize="large">
          <Center gap="2">{name}</Center>
        </Flex>

        <Text color="app.onSurfaceMuted" fontSize="sm">
          @{username}
        </Text>

        <Text color="app.onSurface" my="2">
          {bio}
        </Text>

        {/* Membuka menu Follows dengan tab sesuai angka yang diklik. */}
        <Flex gap="4" color="app.onSurface">
          <Link
            as={RouterLink}
            to="/follows?tab=followers"
            display="flex"
            gap="1"
            _hover={{ textDecoration: "underline" }}
          >
            {follower}
            <Text color="app.onSurfaceMuted">{t("common.followers")}</Text>
          </Link>

          <Link
            as={RouterLink}
            to="/follows?tab=following"
            display="flex"
            gap="1"
            _hover={{ textDecoration: "underline" }}
          >
            {following}
            <Text color="app.onSurfaceMuted">{t("common.following")}</Text>
          </Link>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default CurrentProfile;
