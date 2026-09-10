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

// Navbar berlatar gelap, jadi menggelapkan teksnya justru membuat tidak terbaca.
// Di sini arahnya dibalik: item memakai warna aksen aplikasi saat disorot.
//
// Sebelumnya efeknya gray.300 -> white di atas latar #1D1D1D -> #262626, dan
// kedua perubahan itu terlalu tipis untuk benar-benar terlihat.
export const navItemHover = {
    transition: "background-color 0.15s ease",
    _hover: { bg: "whiteAlpha.200" },
};

export const navTextOnGroupHover = {
    transition: "color 0.15s ease",
    _groupHover: { color: "green.500" },
};
