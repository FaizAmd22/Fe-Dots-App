/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Flex, Center, Link, Text } from "@chakra-ui/react";
import { buildMenuItems } from "../menuItems";
import UnreadBadge from "../UnreadBadge";
import { navTextOnGroupHover } from "../../../features/HoverStyles";
import { useSelector } from "react-redux";
import { selectUser } from "../../../slices/userSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";
// import { Link } from "react-router-dom";

const MobileNavbar = () => {
  const user = useSelector(selectUser);
  const token = sessionStorage.getItem("token");
  const [selected, setSelected] = useState<string>("Home");
  const navigate = useNavigate();
  const ListNavbar = buildMenuItems(user.username);

  const handleClick = (name: string, path: string) => {
    if (!token) {
      if (name == "Home") {
        // window.location.assign(path);
        navigate(path);
        // console.log(true);
      } else {
        Swal.fire({
          title: "You need to login first!",
          text: "Do you wanna login?",
          background: "#2b2b2b",
          color: "white",
          showCancelButton: true,
          confirmButtonText: "Yes",
          reverseButtons: true,
        }).then((result: any) => {
          if (result.isConfirmed) {
            // window.location.replace("/login");
            navigate("/login");
          }
        });
        // console.log(false);
      }
    } else {
      // window.location.assign(path);
      navigate(path);
      setSelected(path);
    }
  };

  return (
    <Center h="9vh" bg="#262626">
      {/* Dulu gap="20" yang dikalibrasi untuk 4 ikon; dengan 5 ikon itu meluber
          di layar kecil, jadi jaraknya dibiarkan menyesuaikan lebar layar. */}
      <Flex w="100%" px="6" justifyContent="space-between">
        {ListNavbar.map((data, index) => {
          return (
            <Link
              key={index}
              fontSize="25px"
              onClick={() => handleClick(data.name, data.path)}
            >
              <Box position="relative" role="group">
                <Text
                  color={selected == data.path ? "white" : "#767676"}
                  {...navTextOnGroupHover}
                >
                  {data.icon}
                </Text>

                {data.name === "Chat" && <UnreadBadge floating />}
              </Box>
            </Link>
          );
        })}
      </Flex>
    </Center>
  );
};

export default MobileNavbar;
