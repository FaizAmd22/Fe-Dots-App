/* eslint-disable react-hooks/exhaustive-deps */
import {
  Text,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabIndicator,
  Box,
  Button,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { IUsers } from "../../interfaces/UsersInterface";
import UserCard from "../../component/UserCard";
import { useSelector } from "react-redux";
import { selectFollower, selectFollowing } from "../../slices/followSlice";
import { useFollowHooks } from "../../hooks/follow";
import { useTranslation } from "../../i18n/useTranslation";

const Follows = () => {
  const { t } = useTranslation();
  const { fetchFollow } = useFollowHooks();
  const follower = useSelector(selectFollower);
  const following = useSelector(selectFollowing);

  useEffect(() => {
    fetchFollow();
  }, []);

  // console.log("data :", data)
  return (
    <Stack h="100%" color="app.text" py={{ base: "0", md: "4" }} px="4">
      <Text fontSize="2xl" pt={{ base: "0", md: "4" }} fontWeight="semibold">
        {t("follows.title")}
      </Text>

      {/* Kolom flex supaya panel daftar mengisi sisa tinggi halaman. */}
      <Tabs
        isFitted
        variant="unstyled"
        display="flex"
        flexDirection="column"
        flex="1"
        minH="0"
      >
        {/* Dibungkus Box relatif: TabIndicator memakai position absolute
            tanpa "top", jadi posisinya mengikuti letak statisnya. Di dalam
            Tabs yang kini kolom flex, letak statis itu jatuh ke puncak Tabs
            dan garisnya tampil di bawah judul, bukan di bawah tab. */}
        <Box position="relative">
          <TabList>
            <Tab>
              <Button
                w="100%"
                bg="none"
                color="app.text"
                _hover={{ bg: "none" }}
                onClick={() => fetchFollow()}
              >
                {t("follows.followers")}
              </Button>
            </Tab>
            <Tab>
              <Button
                w="100%"
                bg="none"
                color="app.text"
                _hover={{ bg: "none" }}
                onClick={() => fetchFollow()}
              >
                {t("follows.followings")}
              </Button>
            </Tab>
          </TabList>

          <TabIndicator
            mt="-1.5px"
            height="2px"
            bg="green.500"
            borderRadius="1px"
          />
        </Box>

        <TabPanels flex="1" minH="0">
          <TabPanel
            h="100%"
            gap="5"
            mt={4}
            pt={5}
            py="0"
            display="flex"
            flexDirection="column"
            overflow="auto"
            sx={{
              "&::-webkit-scrollbar": {
                width: "6px",
                backgroundColor: `none`,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: `green.500`,
                borderRadius: "3px",
              },
            }}
          >
            {follower.map((data: IUsers) => {
              return (
                <Box color="app.text" key={data.id}>
                  <UserCard data={data} type="follower" />
                </Box>
              );
            })}
            {/* <Text>Follower</Text> */}
          </TabPanel>

          <TabPanel
            h="100%"
            gap="5"
            mt={4}
            pt={5}
            py="0"
            display="flex"
            flexDirection="column"
            overflow="auto"
            sx={{
              "&::-webkit-scrollbar": {
                width: "6px",
                backgroundColor: `none`,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: `green.500`,
                borderRadius: "3px",
              },
            }}
          >
            {following.map((data: IUsers) => {
              return (
                <Box color="app.text" key={data.id}>
                  <UserCard data={data} type="following" />
                </Box>
              );
            })}
            {/* <Text>Following</Text> */}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default Follows;
