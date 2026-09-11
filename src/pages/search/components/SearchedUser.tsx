import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import UserCard from "../../../component/UserCard";
import { IUsers } from "../../../interfaces/UsersInterface";
import { selectUsers } from "../../../slices/searchedUserSlice";

const SearchedUser = () => {
  const users = useSelector(selectUsers);
  // console.log("users di searchUser:", users);
  const id = sessionStorage.getItem("id");

  const filter = users.filter((user: IUsers) => user.id != id);

  return (
    <Box>
      {filter.map((data: IUsers) => {
        return (
          <Box key={data.id} py="3" color="app.text">
            <UserCard data={data} type="" />
          </Box>
        );
      })}
    </Box>
  );
};

export default SearchedUser;
