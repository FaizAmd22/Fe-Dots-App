import { RiHome7Line } from "react-icons/ri";
import { TbUserSearch } from "react-icons/tb";
import { LuHeart, LuMessageCircle } from "react-icons/lu";
import { HiOutlineUserCircle } from "react-icons/hi2";

// Dipakai bersama oleh navbar desktop dan MobileNavbar. Sebelumnya array ini
// disalin di kedua file, sehingga menu baru gampang lupa ditambahkan di salah satu.
export const buildMenuItems = (username?: string) => [
    {
        name: "Home",
        path: "/",
        icon: <RiHome7Line />,
    },
    {
        name: "Search",
        path: "/search",
        icon: <TbUserSearch />,
    },
    {
        name: "Chat",
        path: "/chat",
        icon: <LuMessageCircle />,
    },
    {
        name: "Follows",
        path: "/follows",
        icon: <LuHeart />,
    },
    {
        name: "Profile",
        path: `/profile/${username}`,
        icon: <HiOutlineUserCircle />,
    },
];
