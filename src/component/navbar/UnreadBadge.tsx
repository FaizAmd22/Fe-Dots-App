import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { selectUnreadTotal } from "../../slices/chatSlice";

// Jumlah pesan belum dibaca di menu Chat. Dipakai navbar desktop maupun mobile
// supaya angkanya tidak dihitung dua kali dengan cara berbeda.
const UnreadBadge = ({ floating = false }: { floating?: boolean }) => {
  const unreadTotal = useSelector(selectUnreadTotal);

  if (!unreadTotal) return null;

  return (
    <Box
      px="1.5"
      minW="18px"
      bg="green.500"
      color="white"
      fontSize="10px"
      lineHeight="18px"
      textAlign="center"
      rounded="full"
      fontWeight="bold"
      // Di mobile ikonnya tanpa label, jadi badge ditempel di pojok ikon.
      {...(floating
        ? { position: "absolute", top: "-4px", right: "-8px" }
        : { ml: "2" })}
    >
      {unreadTotal > 99 ? "99+" : unreadTotal}
    </Box>
  );
};

export default UnreadBadge;
