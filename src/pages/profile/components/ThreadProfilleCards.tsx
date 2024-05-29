/* eslint-disable react-hooks/exhaustive-deps */
import {
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useProfileThreadHooks } from "../../../hooks/profileThread";
import { IThreads } from "../../../interfaces/ThreadInterface";
import { useParams } from "react-router-dom";
import {
  selectProfileThread,
} from "../../../slices/profileThreadSlice";
import ThreadCard from "../../../component/ThreadCard";
import { LoadingThread } from "../../../component/LoadingCard";

const ThreadProfileCards = () => {
  const { username } = useParams();
  const profileThreads = useSelector(selectProfileThread);
  const token = sessionStorage.getItem("token");
  const { fetchProfileThread, fetchProfileThreadAuth } =
    useProfileThreadHooks();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  console.log("filtered :", profileThreads);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        await fetchProfileThreadAuth()
      } else {
        await fetchProfileThread();
      }
      setIsLoading(false);
    };
    fetchData();
  }, [username]);

  return (
    <>
      {isLoading ? (
        <Stack
        gap="10"
        w="100%"
        m="auto"
        mt='50px'
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <LoadingThread />
      </Stack>
      ) : (
        profileThreads.map((thread: IThreads, index: number) => {
          return (
            <ThreadCard
              key={index}
              thread={thread}
              index={index}
              type="threads"
            />
          );
        })
      )}
      ;
    </>
  );
  // return profileThreads.map((thread: IThreads, index: number) => {
  //   return (
  //     <CardItems
  //       key={index}
  //       thread={thread}
  //       index={index}
  //       type="threads"
  //     />
  //   );
  // })
  // return (
  //   <Text>testttt</Text>
  // )
};

export default ThreadProfileCards;
