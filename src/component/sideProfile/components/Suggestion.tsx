/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSuggestionHooks } from "../../../hooks/suggestion";
import { IUsers } from "../../../interfaces/UsersInterface";
import { selectSuggestion } from "../../../slices/suggestionSlice";
import { LoadingUserCard } from "../../LoadingCard";
import UserCard from "../../UserCard";

const Suggestion = () => {
  const suggestionData = useSelector(selectSuggestion);
  const { fetchSuggestion } = useSuggestionHooks();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const loopingLoading = [1, 2, 3, 4];

  useEffect(() => {
    // setIsLoading(true);
    fetchSuggestion();

    // setTimeout(() => {
      setIsLoading(false);
    // }, 500);
  }, []);

  return (
    <>
      {isLoading ? (
        <Box display='flex' flexDirection='column' gap='6'>
          {loopingLoading.map((_, index: number) => {
            return <LoadingUserCard key={index} />;
          })}
        </Box>
      ) : (
        <Box
          h="30vh"
          px="4"
          rounded="lg"
          bg="app.surface"
          color="app.onSurface"
          overflowY="auto"
          overflowX="hidden"
          sx={{
            "&::-webkit-scrollbar": {
              width: "6px",
              backgroundColor: `none`,
            },
            // Hijau di atas panel hijau tidak terlihat.
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "app.surfaceAccent",
              borderRadius: "3px",
            },
          }}
        >
          {suggestionData.map((data: IUsers) => {
            return (
              <Box key={data.id} py="3">
                <UserCard data={data} type="suggestion" />
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
};

export default Suggestion;
