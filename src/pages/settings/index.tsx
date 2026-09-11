import { Box, Circle, Flex, Grid, Stack, Text, useColorMode } from "@chakra-ui/react";
import { LuCheck, LuMoon, LuSun } from "react-icons/lu";
import theme from "../../theme";
import type { Language, TranslationKey } from "../../i18n/translate";
import { useTranslation } from "../../i18n/useTranslation";

type Palette = { bg: string; surface: string; text: string; line: string };
type ModeValue = { default: string; _dark: string };

// Pratinjau diambil langsung dari token tema, supaya selalu sama dengan palet
// yang benar-benar dipakai walau warnanya diganti di theme.ts. Nilai mentah
// (default/_dark) dipakai, bukan token, karena pratinjau "Terang" harus tetap
// terang walau aplikasi sedang gelap, dan sebaliknya.
const appColors = (
  theme as unknown as { semanticTokens: { colors: { app: Record<string, ModeValue> } } }
).semanticTokens.colors.app;

const paletteFor = (mode: "default" | "_dark"): Palette => ({
  bg: appColors.bg[mode],
  surface: appColors.surface[mode],
  text: appColors.text[mode],
  line: appColors.border[mode],
});

const THEME_OPTIONS: Array<{
  value: "light" | "dark";
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: JSX.Element;
  palette: Palette;
}> = [
  {
    value: "light",
    labelKey: "settings.light",
    descriptionKey: "settings.lightDesc",
    icon: <LuSun />,
    palette: paletteFor("default"),
  },
  {
    value: "dark",
    labelKey: "settings.dark",
    descriptionKey: "settings.darkDesc",
    icon: <LuMoon />,
    palette: paletteFor("_dark"),
  },
];

// Nama bahasa ditulis dalam bahasanya sendiri, supaya tetap bisa ditemukan
// oleh orang yang tidak paham bahasa yang sedang aktif.
const LANGUAGE_OPTIONS: Array<{ code: Language; label: string; hintKey: TranslationKey }> = [
  { code: "id", label: "Bahasa Indonesia", hintKey: "settings.languageIdHint" },
  { code: "en", label: "English", hintKey: "settings.languageEnHint" },
];

const scrollbar = {
  "&::-webkit-scrollbar": { width: "6px", backgroundColor: "none" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "green.500", borderRadius: "3px" },
};

// Gaya kartu pilihan yang bisa diklik (tema dan bahasa).
const optionStyle = (isActive: boolean) => ({
  as: "button" as const,
  type: "button" as const,
  role: "radio",
  "aria-checked": isActive,
  textAlign: "left" as const,
  p: "3",
  rounded: "lg",
  bg: "app.card",
  border: "2px",
  borderColor: isActive ? "green.500" : "app.border",
  transition: "border-color 0.15s ease",
  _hover: { borderColor: isActive ? "green.500" : "app.borderStrong" },
  _focusVisible: { outline: "2px solid", outlineColor: "green.500", outlineOffset: "2px" },
});

const CheckMark = () => (
  <Circle size="20px" ml="auto" bg="green.500" color="white" fontSize="xs" flexShrink={0}>
    <LuCheck />
  </Circle>
);

// Miniatur tampilan Dots dengan palet tema tersebut. Sengaja memakai warna
// tetap, bukan token, supaya pratinjau "Terang" tetap terang walau aplikasi
// sedang gelap (dan sebaliknya).
const ThemePreview = ({ palette }: { palette: Palette }) => (
  <Box
    aria-hidden
    bg={palette.bg}
    rounded="md"
    p="2.5"
    border="1px"
    borderColor={palette.line}
  >
    <Flex gap="2" alignItems="center" mb="2">
      <Circle size="14px" bg="green.500" />
      <Box h="6px" w="45%" rounded="full" bg={palette.text} opacity={0.8} />
    </Flex>
    <Box bg={palette.surface} rounded="sm" p="2">
      <Box h="5px" w="80%" rounded="full" bg={palette.text} opacity={0.5} mb="1.5" />
      <Box h="5px" w="55%" rounded="full" bg={palette.text} opacity={0.3} />
    </Box>
  </Box>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <Box as="section">
    <Text fontWeight="semibold" fontSize="lg">
      {title}
    </Text>
    <Text fontSize="sm" color="gray.500" mb="3">
      {description}
    </Text>
    {children}
  </Box>
);

const Settings = () => {
  const { colorMode, setColorMode } = useColorMode();
  const { t, language, setLanguage } = useTranslation();

  return (
    <Stack h="100%" px="4" pb="0" spacing="0">
      <Text fontSize="2xl" fontWeight="semibold" py={{ base: "0", md: "4" }} mb="4">
        {t("settings.title")}
      </Text>

      <Stack flex="1" minH="0" overflowY="auto" spacing="8" pb="6" pr="1" sx={scrollbar}>
        <Section title={t("settings.theme")} description={t("settings.themeDesc")}>
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap="3"
            role="radiogroup"
            aria-label={t("settings.theme")}
          >
            {THEME_OPTIONS.map((option) => {
              const isActive = colorMode === option.value;

              return (
                <Box
                  key={option.value}
                  {...optionStyle(isActive)}
                  onClick={() => setColorMode(option.value)}
                >
                  <ThemePreview palette={option.palette} />

                  <Flex mt="3" alignItems="center" gap="2">
                    <Box fontSize="lg">{option.icon}</Box>
                    <Text fontWeight="semibold">{t(option.labelKey)}</Text>
                    {isActive && <CheckMark />}
                  </Flex>

                  <Text fontSize="xs" color="gray.500" mt="1">
                    {t(option.descriptionKey)}
                  </Text>
                </Box>
              );
            })}
          </Grid>
        </Section>

        <Section title={t("settings.language")} description={t("settings.languageDesc")}>
          <Stack spacing="2" role="radiogroup" aria-label={t("settings.language")}>
            {LANGUAGE_OPTIONS.map((option) => {
              const isActive = language === option.code;

              return (
                <Flex
                  key={option.code}
                  {...optionStyle(isActive)}
                  alignItems="center"
                  gap="3"
                  onClick={() => setLanguage(option.code)}
                >
                  <Box>
                    <Text fontWeight="semibold">{option.label}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {t(option.hintKey)}
                    </Text>
                  </Box>
                  {isActive && <CheckMark />}
                </Flex>
              );
            })}
          </Stack>
        </Section>
      </Stack>
    </Stack>
  );
};

export default Settings;
