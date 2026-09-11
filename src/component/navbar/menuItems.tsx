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
import type { TranslationKey } from "../../i18n/translate";

type MenuItem = {
    // Nama tetap berbahasa Inggris dan dipakai untuk logika (misalnya tamu
    // hanya boleh membuka "Home"); yang tampil ke user adalah labelKey.
    name: string;
    labelKey: TranslationKey;
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
        labelKey: "nav.home",
        path: "/",
        icon: <LuHome />,
        mobile: true,
    },
    {
        name: "Search",
        labelKey: "nav.search",
        path: "/search",
        icon: <TbUserSearch />,
        mobile: true,
    },
    {
        name: "Chat",
        labelKey: "nav.chat",
        path: "/chat",
        icon: <LuMessageCircle />,
        badge: "chat",
        mobile: true,
    },
    {
        name: "Notifications",
        labelKey: "nav.notifications",
        path: "/notifications",
        icon: <LuBell />,
        badge: "notification",
        mobile: true,
    },
    {
        name: "Follows",
        labelKey: "nav.follows",
        path: "/follows",
        icon: <LuHeart />,
    },
    {
        name: "Profile",
        labelKey: "nav.profile",
        path: `/profile/${username}`,
        icon: <LuUserCircle />,
    },
    {
        name: "Settings",
        labelKey: "nav.settings",
        path: "/settings",
        icon: <LuSettings />,
    },
];
