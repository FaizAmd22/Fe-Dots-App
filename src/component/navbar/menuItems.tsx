import { RiHome7Line } from "react-icons/ri";
import { TbUserSearch } from "react-icons/tb";
import { LuBell, LuHeart, LuMessageCircle } from "react-icons/lu";
import { HiOutlineUserCircle } from "react-icons/hi2";
import type { BadgeKind } from "./UnreadBadge";

type MenuItem = {
    name: string;
    path: string;
    icon: JSX.Element;
    // Menu yang menampilkan angka belum dibaca.
    badge?: BadgeKind;
};

// Dipakai bersama oleh navbar desktop dan MobileNavbar. Sebelumnya array ini
// disalin di kedua file, sehingga menu baru gampang lupa ditambahkan di salah satu.
export const buildMenuItems = (username?: string): MenuItem[] => [
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
        badge: "chat",
    },
    {
        name: "Notifications",
        path: "/notifications",
        icon: <LuBell />,
        badge: "notification",
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
