/* eslint-disable react-hooks/exhaustive-deps */
import { Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LoadingThread } from "../../../component/LoadingCard";
import ThreadCard from "../../../component/ThreadCard";
import { useThreadsHooks } from "../../../hooks/threads";
import { IThreads } from "../../../interfaces/ThreadInterface";
import { selectThread } from "../../../slices/threadSlice";

const Threads = () => {
  const { fetchThread, fetchThreadAuth } = useThreadsHooks();
  const token = sessionStorage.getItem("token");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const loopingLoading = [1, 2, 3, 4];
  const datas = useSelector(selectThread);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (token) {
        await fetchThreadAuth();
      } else {
        await fetchThread();
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    // Mengisi sisa tinggi halaman di bawah form post, apa pun ukuran layarnya.
    <Stack
      flex="1"
      minH="0"
      paddingRight={2}
      mt={{ base: "2", md: "5" }}
      overflowY="auto"
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
      {isLoading ? (
        <Stack
          gap="10"
          w="100%"
          m="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {loopingLoading.map((_, index: number) => {
            return <LoadingThread key={index} />;
          })}
        </Stack>
      ) : (
        // Itemnya adalah thread itu sendiri (IThreads), bukan pembungkus
        // props ThreadInterface — anotasi lamanya membuat thread.id ditolak.
        datas.map((thread: IThreads) => {
          return <ThreadCard key={thread.id} thread={thread} />;
        })
      )}
    </Stack>
  );
};

export default Threads;
