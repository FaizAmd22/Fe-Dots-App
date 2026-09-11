import { TbUserSearch } from "react-icons/tb";
import {
    LuBell,
    LuHeart,
    LuHome,
    LuMessageCircle,
    LuSettings,
    LuUserCircle,
} from "react-icons/lu";
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
//
// Semua ikon berupa ikon GARIS supaya bisa ditebalkan seragam saat aktif atau
// di-hover (lihat navIconStyle). Home dan Profile dulu memakai ikon isian
// (Remix) dan ikon Heroicons yang garisnya lebih tipis.
export const buildMenuItems = (username?: string): MenuItem[] => [
    {
        name: "Home",
        path: "/",
        icon: <LuHome />,
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
        icon: <LuUserCircle />,
    },
    {
        name: "Settings",
        path: "/settings",
        icon: <LuSettings />,
    },
];
