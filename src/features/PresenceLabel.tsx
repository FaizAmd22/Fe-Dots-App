import { Flex, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa6";

// Waktu terakhir online ditulis relatif untuk jarak dekat, lalu beralih ke
// tanggal — "Terakhir online 3 minggu lalu" tidak banyak membantu.
export const formatLastSeen = (value?: string | null) => {
  if (!value) return "Offline";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "Offline";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "Terakhir online baru saja";
  if (minutes < 60) return `Terakhir online ${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Terakhir online ${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return `Terakhir online kemarin ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  if (days < 7) return `Terakhir online ${days} hari lalu`;

  return `Terakhir online ${date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
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
}) => (
  <Flex gap="2" alignItems="center">
    <FaCircle color={isOnline ? "#38A169" : "#718096"} size="10px" />
    <Text fontSize={fontSize} color={isOnline ? "app.textSoft" : "gray.500"}>
      {isOnline ? "Online" : showLastSeen ? formatLastSeen(lastSeenAt) : "Offline"}
    </Text>
  </Flex>
);

export default PresenceLabel;
