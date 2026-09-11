// Gaya hover seragam untuk semua elemen yang mengarah ke profil user.
//
// Memakai filter brightness, bukan warna tetap, supaya satu gaya ini bisa
// dipasang pada Avatar (gambar) maupun Text tanpa perlu tahu warna aslinya.
export const darkenOnHover = {
    transition: "filter 0.15s ease",
    _hover: { filter: "brightness(0.6)" },
};

// Versi untuk elemen yang berada di dalam blok yang bisa diklik: seluruh blok
// yang di-hover, avatar dan namanya sama-sama menggelap.
export const darkenOnGroupHover = {
    transition: "filter 0.15s ease",
    _groupHover: { filter: "brightness(0.6)" },
};

export const navItemHover = {
    transition: "background-color 0.15s ease",
    _hover: { bg: "app.hover" },
};

// Menu navbar: aktif = hijau dan tebal; hover = HANYA menebal, warnanya tetap.
//
// Ikon navbar sengaja semuanya ikon garis (Lucide/Tabler), karena "tebal"
// pada ikon garis berarti garisnya lebih tebal (stroke-width). Ikon isian
// seperti RiHome7Line tidak bisa ditebalkan dengan cara yang sama.
const NAV_STROKE = 2;
const NAV_STROKE_BOLD = 2.75;
const GROUP_HOVER = "[role=group]:hover &";

export const navIconStyle = (isActive: boolean, inactiveColor?: string) => ({
    color: isActive ? "green.500" : inactiveColor,
    sx: {
        "& svg": {
            strokeWidth: isActive ? NAV_STROKE_BOLD : NAV_STROKE,
            transition: "stroke-width 0.15s ease",
        },
        [`${GROUP_HOVER} svg`]: { strokeWidth: NAV_STROKE_BOLD },
    },
});

export const navLabelStyle = (isActive: boolean) => ({
    color: isActive ? "green.500" : undefined,
    fontWeight: isActive ? "semibold" : "normal",
    sx: { [GROUP_HOVER]: { fontWeight: "semibold" } },
});
