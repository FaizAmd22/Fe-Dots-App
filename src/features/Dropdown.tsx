/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  IconButton,
} from "@chakra-ui/react";
import { MdEdit } from "react-icons/md";
import { IoMdShare } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import AlertDelete from "./AlertDelete";

const Dropdown = (data: any) => {
  const userId = sessionStorage.getItem("id");
//   console.log("data dropdown :", data);

  const handleShare = () => {
    const currentUrl = window.location.href
    let getUrl = currentUrl;

    if (!currentUrl.includes("details")) {
      getUrl = `${currentUrl}details/${data.id}`;
    //   console.log("getUrl :", getUrl);
    }
    if (currentUrl.includes("profile")) {
      getUrl = `http://localhost:5173/details/${data.id}`;
    //   console.log("getUrl :", getUrl);
    }

    navigator.clipboard.writeText(getUrl).then(
      function () {
        console.log("Copied!");
        alert("Copied!");
      },
      function () {
        console.log("Copy error");
        alert("Copy error!");
      }
    );
  };


  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<BsThreeDotsVertical />}
        variant="none"
        borderColor="#1D1D1D"
      />
      <MenuList bg="#1D1D1D">
        <MenuItem icon={<IoMdShare />} bg="#1D1D1D" onClick={handleShare}>
          Share
        </MenuItem>
        {data.userId == userId && (
          <>
            <MenuItem icon={<MdEdit />} bg="#1D1D1D" isDisabled>
              Edit
            </MenuItem>

            <MenuItem
              // icon={<MdEdit />}
              bg="#1D1D1D"
              // onClick={handleDelete}
            >
              {AlertDelete(data)}
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  );
};

export default Dropdown;
