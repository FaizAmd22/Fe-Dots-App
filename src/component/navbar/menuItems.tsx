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
    // Tampil di navbar bawah mobile (maksimal 4). Sisanya ada di menu avatar
    // pada header mobile; sidebar desktop tetap menampilkan semuanya.
    mobile?: boolean;
};

// Dipakai bersama oleh navbar desktop dan MobileNavbar. Sebelumnya array ini
// disalin di kedua file, sehingga menu baru gampang lupa ditambahkan di salah satu.
export const buildMenuItems = (username?: string): MenuItem[] => [
    {
        name: "Home",
        path: "/",
        icon: <RiHome7Line />,
        mobile: true,
    },
    {
        name: "Search",
        path: "/search",
        icon: <TbUserSearch />,
        mobile: true,
    },
    {
        name: "Chat",
        path: "/chat",
        icon: <LuMessageCircle />,
        badge: "chat",
        mobile: true,
    },
    {
        name: "Notifications",
        path: "/notifications",
        icon: <LuBell />,
        badge: "notification",
        mobile: true,
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
