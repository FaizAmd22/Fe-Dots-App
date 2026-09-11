/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Flex, Center, Link, Text } from "@chakra-ui/react";
import { buildMenuItems } from "../menuItems";
import UnreadBadge from "../UnreadBadge";
import { navTextOnGroupHover } from "../../../features/HoverStyles";
import { useSelector } from "react-redux";
import { selectUser } from "../../../slices/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// import { Link } from "react-router-dom";

const MobileNavbar = () => {
  const user = useSelector(selectUser);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ListNavbar = buildMenuItems(user.username).filter((item) => item.mobile);

  // Mengikuti URL, bukan ikon terakhir yang diklik: halaman juga bisa dibuka
  // dari menu avatar, tautan, atau tombol back browser.
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

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
    }
  };

  return (
    // Tinggi mengikuti isi, bukan 9vh: dulu barisnya di layout cuma 5vh
    // sehingga navbar ini meluber menutupi konten. Padding bawah memberi ruang
    // untuk garis home indicator di iPhone.
    <Center bg="#262626" pt="1" pb="calc(4px + env(safe-area-inset-bottom))">
      <Flex w="100%" px="4" justifyContent="space-around">
        {ListNavbar.map((data) => {
          return (
            <Link
              key={data.path}
              p="2"
              fontSize="25px"
              aria-label={data.name}
              onClick={() => handleClick(data.name, data.path)}
            >
              <Box position="relative" role="group">
                <Text
                  color={isActive(data.path) ? "white" : "#767676"}
                  {...navTextOnGroupHover}
                >
                  {data.icon}
                </Text>

                {data.badge && <UnreadBadge floating kind={data.badge} />}
              </Box>
            </Link>
          );
        })}
      </Flex>
    </Center>
  );
};

export default MobileNavbar;
