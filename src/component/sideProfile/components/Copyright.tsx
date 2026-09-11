import { Box, Text, Flex, Center, Link } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { PiInstagramLogoFill } from "react-icons/pi";
import { useTranslation } from "../../../i18n/useTranslation";

const Copyright = () => {
  const { t } = useTranslation();
  return (
    <Box p="4" rounded="lg" color="app.onSurface" bg="app.surface" fontSize="12px">
      <Flex mb="2">
        <Center>
          <Text>
            <Flex gap={1}>
              {t("misc.developedBy")}
              <Text fontWeight="bold">Faizhal Ahmad</Text>
            </Flex>

            <Box pt="1">
              <Flex gap="3">
                <Link
                  target="_blank"
                  href="https://github.com/"
                  fontSize="lg"
                  _hover={{ color: "app.surfaceAccent" }}
                >
                  <FaGithub />
                </Link>

                <Link
                  target="_blank"
                  href="https://www.linkedin.com/"
                  fontSize="lg"
                  _hover={{ color: "app.surfaceAccent" }}
                >
                  <FaLinkedin />
                </Link>

                <Link
                  target="_blank"
                  href="http://instagram.com/"
                  fontSize="lg"
                  _hover={{ color: "app.surfaceAccent" }}
                >
                  <PiInstagramLogoFill />
                </Link>
              </Flex>
            </Box>
          </Text>
        </Center>
      </Flex>
    </Box>
  );
};

export default Copyright;
