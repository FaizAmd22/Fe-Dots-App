/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Text,
  Stack,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { API } from "../../libs/axios";
import { setUsers } from "../../slices/searchedUserSlice";
import SearchedUser from "./components/SearchedUser";
import { useTranslation } from "../../i18n/useTranslation";

const Search = () => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState<any>(null);
  const [dataFilter, setDataFilter] = useState<any>([]);
  const [message, setMessage] = useState<boolean>(false);
  const token = sessionStorage.getItem("token");
  const dispatch = useDispatch();
  dispatch(setUsers(dataFilter));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    const getData = async () => {
      const response = await API.get("/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      // console.log("search :", data);

      if (keyword?.length > 0) {
        const search = keyword.toLowerCase();
        const filter = data.filter(
          (item: any) =>
            item.username?.toLowerCase().includes(search) ||
            item.name?.toLowerCase().includes(search)
        );
        console.log("filter di search :", filter);
        if (filter.length == 0) setMessage(true);
        else setMessage(false);
        setDataFilter(filter);
      } else {
        setDataFilter([]);
        setMessage(false);
      }
    };

    getData();
  }, [keyword]);

  // console.log("filtered :", dataFilter);

  return (
    <Stack h="100%" px="4" pb="0" color="app.text">
      <Text
        pb="2"
        fontSize="2xl"
        fontWeight="semibold"
        py={{ base: "0", md: "4" }}
      >
        {t("search.title")}
      </Text>

      <InputGroup>
        <InputLeftElement pl="2" color="app.textMuted" pointerEvents="none">
          <IoSearchOutline />
        </InputLeftElement>

        <Input
          onChange={handleChange}
          type="text"
          rounded="full"
          name="username"
          placeholder={t("search.placeholder")}
          borderColor="gray.500"
          focusBorderColor="green.500"
        />
      </InputGroup>

      {message && (
        <Text marginX="auto" pt="50" color="app.text">
          {t("search.notFound")}
        </Text>
      )}

      <Box
        flex="1"
        minH="0"
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
        <SearchedUser />
      </Box>
    </Stack>
  );
};

export default Search;
