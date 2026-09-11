import { Flex, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa6";
import type { Translate } from "../i18n/translate";
import { useTranslation } from "../i18n/useTranslation";

// Waktu terakhir online ditulis relatif untuk jarak dekat, lalu beralih ke
// tanggal — "Terakhir online 3 minggu lalu" tidak banyak membantu.
export const formatLastSeen = (
  value: string | null | undefined,
  t: Translate,
  locale: string
) => {
  if (!value) return t("presence.offline");

  const date = new Date(value);
  if (isNaN(date.getTime())) return t("presence.offline");

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return t("presence.justNow");
  if (minutes < 60) return t("presence.minutes", { n: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("presence.hours", { n: hours });

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return t("presence.yesterday", {
      time: date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
    });
  }
  if (days < 7) return t("presence.days", { n: days });

  return t("presence.date", {
    date: date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
  });
};

const PresenceLabel = ({
  isOnline,
  lastSeenAt,
  showLastSeen = true,
  fontSize = "xs",
}: {
  isOnline: boolean;
  lastSeenAt?: string | null;
  // Di halaman profil cukup "Offline" tanpa waktu; di chat waktunya ditampilkan.
  showLastSeen?: boolean;
  fontSize?: string;
}) => {
  const { t, locale } = useTranslation();

  return (
    <Flex gap="2" alignItems="center">
      <FaCircle color={isOnline ? "#38A169" : "#718096"} size="10px" />
      <Text fontSize={fontSize} color={isOnline ? "app.textSoft" : "gray.500"}>
        {isOnline
          ? t("presence.online")
          : showLastSeen
          ? formatLastSeen(lastSeenAt, t, locale)
          : t("presence.offline")}
      </Text>
    </Flex>
  );
};

export default PresenceLabel;
