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
import { UsersInterface } from "../../interfaces/UsersInterface";
import UserCard from "../../component/UserCard";
import { useSelector } from "react-redux";
import { selectFollower, selectFollowing } from "../../slices/followSlice";
import { useFollowHooks } from "../../hooks/follow";

const Follows = () => {
  const { fetchFollow } = useFollowHooks();
  const follower = useSelector(selectFollower);
  const following = useSelector(selectFollowing);

  useEffect(() => {
    fetchFollow();
  }, []);

  // console.log("data :", data)
  return (
    <Stack
      h={{ base: "78vh", md: "100vh" }}
      color="white"
      py={{ base: "0", md: "4" }}
      px="4"
    >
      <Text fontSize="2xl" pt={{ base: "0", md: "4" }} fontWeight="semibold">
        Follows
      </Text>

      <Tabs isFitted variant="unstyled">
        <TabList>
          <Tab>
            <Button
              w="100%"
              bg="none"
              color="white"
              _hover={{ bg: "none" }}
              onClick={() => fetchFollow()}
            >
              Followers
            </Button>
          </Tab>
          <Tab>
            <Button
              w="100%"
              bg="none"
              color="white"
              _hover={{ bg: "none" }}
              onClick={() => fetchFollow()}
            >
              Followings
            </Button>
          </Tab>
        </TabList>

        <TabIndicator
          mt="-1.5px"
          height="2px"
          bg="green.500"
          borderRadius="1px"
        />

        <TabPanels>
          <TabPanel
            h={{ base: "68vh", md: "80vh" }}
            gap="5"
            mt="5"
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
            {follower.map((data: UsersInterface, index: number) => {
              return (
                <Box color="white" key={index}>
                  <UserCard data={data} type="follower" />
                </Box>
              );
            })}
            {/* <Text>Follower</Text> */}
          </TabPanel>

          <TabPanel
            h={{ base: "68vh", md: "80vh" }}
            gap="5"
            mt="5"
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
            {following.map((data: UsersInterface, index: number) => {
              return (
                <Box color="white" key={index}>
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
