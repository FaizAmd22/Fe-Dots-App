import { Text, Stack } from "@chakra-ui/react";
import CreatePost from "../../features/CreatePost";
import Threads from "./components/Threads";
import { useTranslation } from "../../i18n/useTranslation";

const Home = () => {
  const { t } = useTranslation();
  const token = sessionStorage.getItem("token");

  return (
    <Stack p="4" pb="0" color="app.text" h="100%">
      <Text
        py="4"
        fontSize="2xl"
        fontWeight="semibold"
        display={{ base: "none", md: "block" }}
      >
        {t("nav.home")}
      </Text>

      {token && <CreatePost type="threads" />}

      <Threads />
    </Stack>
  );
};

export default Home;
