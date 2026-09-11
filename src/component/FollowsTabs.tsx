import {
  Box,
  Stack,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import UserCard from "./UserCard";
import { LoadingUserCard } from "./LoadingCard";
import { IUsers } from "../interfaces/UsersInterface";
import { useTranslation } from "../i18n/useTranslation";

export type FollowsTab = "followers" | "following";

const scrollbar = {
  "&::-webkit-scrollbar": { width: "6px", backgroundColor: "none" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "green.500", borderRadius: "3px" },
};

// Tab Followers/Following beserta daftarnya. Dipakai menu Follows (daftar
// milik sendiri) dan halaman followers user lain, supaya tampilannya sama.
// Tab dikendalikan dari luar karena tab aktif disimpan di URL.
const FollowsTabs = ({
  tab,
  onTabChange,
  followers,
  following,
  isLoading,
}: {
  tab: FollowsTab;
  onTabChange: (tab: FollowsTab) => void;
  followers: IUsers[];
  following: IUsers[];
  isLoading: boolean;
}) => {
  const { t } = useTranslation();

  const panels = [
    { list: followers, empty: t("follows.emptyFollowers") },
    { list: following, empty: t("follows.emptyFollowing") },
  ];

  return (
    <Tabs
      index={tab === "following" ? 1 : 0}
      onChange={(index) => onTabChange(index === 1 ? "following" : "followers")}
      isFitted
      variant="unstyled"
      display="flex"
      flexDirection="column"
      flex="1"
      minH="0"
    >
      {/* Dibungkus Box relatif: TabIndicator memakai position absolute
          tanpa "top", jadi posisinya mengikuti letak statisnya. Di dalam
          Tabs yang berupa kolom flex, letak statis itu jatuh ke puncak Tabs
          dan garisnya tampil di bawah judul, bukan di bawah tab. */}
      <Box position="relative">
        <TabList borderBottom="1px" borderColor="app.border">
          <Tab fontWeight="semibold" color="app.textMuted" _selected={{ color: "app.text" }}>
            {t("follows.followers")}
          </Tab>
          <Tab fontWeight="semibold" color="app.textMuted" _selected={{ color: "app.text" }}>
            {t("follows.followings")}
          </Tab>
        </TabList>
        <TabIndicator mt="-1.5px" height="2px" bg="green.500" borderRadius="1px" />
      </Box>

      <TabPanels flex="1" minH="0">
        {panels.map((panel, index) => (
          <TabPanel
            key={index}
            h="100%"
            px="0"
            pt="5"
            pb="4"
            display="flex"
            flexDirection="column"
            gap="5"
            overflowY="auto"
            // Daftar hanya boleh digulir ke bawah, tidak ke samping.
            overflowX="hidden"
            sx={scrollbar}
          >
            {isLoading ? (
              <Stack gap="6">
                {[1, 2, 3, 4].map((item) => (
                  <LoadingUserCard key={item} />
                ))}
              </Stack>
            ) : panel.list.length ? (
              panel.list.map((user) => (
                <Box key={user.id} color="app.text">
                  <UserCard data={user} type="" />
                </Box>
              ))
            ) : (
              <Text color="gray.500" textAlign="center" pt="16">
                {panel.empty}
              </Text>
            )}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};

export default FollowsTabs;
