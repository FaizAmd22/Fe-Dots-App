import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Circle,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LuArrowLeft, LuBell, LuImage, LuMessageCircle, LuMoon, LuSun } from "react-icons/lu";
import BrandLogo from "../BrandLogo";
import type { Language, TranslationKey } from "../../i18n/translate";
import { useTranslation } from "../../i18n/useTranslation";

const FEATURES: Array<{ icon: JSX.Element; key: TranslationKey }> = [
  { icon: <LuImage />, key: "auth.featureThreads" },
  { icon: <LuMessageCircle />, key: "auth.featureChat" },
  { icon: <LuBell />, key: "auth.featureNotifications" },
];

const LANGUAGES: Language[] = ["id", "en"];

// Panel kiri (desktop saja). Motif lingkaran merujuk ke nama "Dots"; sengaja
// samar supaya tidak bersaing dengan teks.
const BrandPanel = () => {
  const { t } = useTranslation();

  return (
    <Flex
      display={{ base: "none", lg: "flex" }}
      w="46%"
      maxW="620px"
      direction="column"
      justifyContent="space-between"
      p="12"
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, green.500, green.700)"
      color="white"
    >
      <Circle size="440px" bg="whiteAlpha.100" position="absolute" top="-140px" right="-160px" />
      <Circle size="240px" bg="whiteAlpha.100" position="absolute" bottom="60px" left="-90px" />
      <Circle size="16px" bg="whiteAlpha.500" position="absolute" top="34%" right="16%" />
      <Circle size="10px" bg="whiteAlpha.400" position="absolute" bottom="30%" right="30%" />

      <Image src="/logos/logo-text-white.svg" alt="Dots" h="44px" w="auto" alignSelf="flex-start" position="relative" />

      <Stack spacing="5" maxW="440px" position="relative">
        <Heading as="p" fontSize="4xl" lineHeight="1.15" fontWeight="bold" letterSpacing="-0.02em">
          {t("auth.brandTitle")}
        </Heading>
        <Text fontSize="lg" color="whiteAlpha.800">
          {t("auth.brandTagline")}
        </Text>

        <Stack spacing="3" pt="4">
          {FEATURES.map((feature) => (
            <HStack key={feature.key} spacing="3">
              <Circle size="36px" bg="whiteAlpha.200" fontSize="lg" flexShrink={0}>
                {feature.icon}
              </Circle>
              <Text>{t(feature.key)}</Text>
            </HStack>
          ))}
        </Stack>
      </Stack>

      <Text fontSize="sm" color="whiteAlpha.700" position="relative">
        © {new Date().getFullYear()} Dots.
      </Text>
    </Flex>
  );
};

// Tamu belum bisa membuka Settings, jadi tema dan bahasa bisa diganti dari sini.
const Preferences = () => {
  const { t, language, setLanguage } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <HStack spacing="2">
      <HStack
        spacing="0"
        p="0.5"
        border="1px"
        borderColor="app.border"
        rounded="full"
        role="radiogroup"
        aria-label={t("settings.language")}
      >
        {LANGUAGES.map((code) => {
          const isActive = language === code;
          return (
            <Button
              key={code}
              size="xs"
              px="2.5"
              rounded="full"
              role="radio"
              aria-checked={isActive}
              bg={isActive ? "green.500" : "transparent"}
              color={isActive ? "white" : "app.textMuted"}
              _hover={{ bg: isActive ? "green.500" : "app.hover" }}
              onClick={() => setLanguage(code)}
            >
              {code.toUpperCase()}
            </Button>
          );
        })}
      </HStack>

      <IconButton
        size="sm"
        variant="ghost"
        rounded="full"
        color="app.textMuted"
        aria-label={t("auth.toggleTheme")}
        icon={colorMode === "dark" ? <LuSun /> : <LuMoon />}
        _hover={{ bg: "app.hover", color: "app.text" }}
        onClick={toggleColorMode}
      />
    </HStack>
  );
};

// Kerangka bersama halaman login, register, dan lengkapi profil.
const AuthLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      minH="100vh"
      sx={{ "@supports (height: 100dvh)": { minHeight: "100dvh" } }}
      bg="app.bg"
      color="app.text"
    >
      <BrandPanel />

      <Flex flex="1" direction="column" px={{ base: "5", sm: "8" }} py={{ base: "4", md: "6" }}>
        <Flex justifyContent="space-between" alignItems="center" gap="3">
          <Link
            as={RouterLink}
            to="/"
            display="inline-flex"
            alignItems="center"
            gap="2"
            fontSize="sm"
            color="app.textMuted"
            _hover={{ color: "app.text", textDecoration: "none" }}
          >
            <LuArrowLeft />
            {t("auth.backToHome")}
          </Link>

          <Preferences />
        </Flex>

        <Flex flex="1" alignItems="center" justifyContent="center" py={{ base: "8", md: "10" }}>
          <Box w="100%" maxW="400px">
            {/* Di layar kecil panel brand disembunyikan, jadi logo pindah ke sini. */}
            <BrandLogo h="40px" mb="8" display={{ base: "block", lg: "none" }} />

            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" letterSpacing="-0.02em">
              {title}
            </Heading>
            {subtitle && (
              <Text mt="2" color="app.textMuted">
                {subtitle}
              </Text>
            )}

            <Box mt="8">{children}</Box>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const AuthDivider = ({ label }: { label: string }) => (
  <Flex alignItems="center" gap="3" my="6">
    <Divider borderColor="app.border" />
    <Text fontSize="sm" color="app.textMuted" flexShrink={0}>
      {label}
    </Text>
    <Divider borderColor="app.border" />
  </Flex>
);

export const AuthError = ({ message }: { message: string }) => (
  <Alert status="error" variant="subtle" rounded="lg" fontSize="sm" py="2.5">
    <AlertIcon />
    {message}
  </Alert>
);

// Tombol utama form auth. Warna ditulis langsung, bukan colorScheme: di mode
// gelap colorScheme="green" berubah menjadi hijau pucat dengan teks gelap.
export const AuthSubmitButton = ({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: ReactNode;
}) => (
  <Button
    type="submit"
    w="100%"
    size="lg"
    rounded="xl"
    bg="green.500"
    color="white"
    _hover={{ bg: "green.600" }}
    _active={{ bg: "green.700" }}
    isLoading={isLoading}
  >
    {children}
  </Button>
);

export default AuthLayout;
