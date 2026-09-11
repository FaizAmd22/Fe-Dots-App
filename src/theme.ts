import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Gelap tetap menjadi tampilan awal (tampilan Dots selama ini). Pilihan user
// disimpan Chakra di localStorage ("chakra-ui-color-mode"), jadi bertahan
// setelah refresh. Mengikuti tema OS sengaja dimatikan: user memilih sendiri
// lewat halaman Settings.
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

// Warna yang berganti mengikuti tema. Nilai _dark SAMA PERSIS dengan warna
// yang dulu ditulis langsung di komponen, supaya mode gelap tidak berubah
// sedikit pun; yang baru hanya pasangan terangnya.
//
// Pakai token ini, bukan "white" / "#1D1D1D", untuk elemen yang harus ikut
// tema. Warna di atas latar berwarna tetap (teks putih di tombol hijau, dsb.)
// tetap ditulis langsung.
const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      app: {
        // Latar halaman, modal, dan kolom layout.
        bg: { default: "#F9F5F0", _dark: "#1D1D1D" },
        // Panel di sidebar (My Profile, Suggestion, Copyright). Teks di
        // atasnya memakai onSurface*, bukan text*.
        surface: { default: "green.500", _dark: "#262626" },
        onSurface: { default: "white", _dark: "#FFFFFF" },
        onSurfaceMuted: { default: "whiteAlpha.800", _dark: "gray.500" },
        // Warna sorot/hover di atas surface: hijau di atas hijau tidak terlihat.
        surfaceAccent: { default: "gray.900", _dark: "green.500" },

        // Kartu netral: menu popup, pilihan di Settings, gelembung chat lawan
        // bicara, dan hover tombol ikon. Sengaja terpisah dari surface supaya
        // elemen hijau (ikon, tulisan merah, gelembung sendiri) tetap terlihat.
        card: { default: "#FFFFFF", _dark: "#262626" },
        cardHover: { default: "gray.100", _dark: "#333333" },

        // Navbar bawah mobile: ikon aktifnya hijau, jadi latarnya tidak boleh
        // hijau. Garis atas hanya di mode terang (latar dan halaman mirip).
        navBar: { default: "#FFFFFF", _dark: "#262626" },
        navBarBorder: { default: "blackAlpha.200", _dark: "transparent" },

        // Teks utama dan teks pendukung.
        text: { default: "#18181B", _dark: "#FFFFFF" },
        textSoft: { default: "gray.700", _dark: "gray.300" },
        textMuted: { default: "gray.600", _dark: "gray.400" },
        textHover: { default: "gray.900", _dark: "gray.200" },
        iconInactive: { default: "gray.400", _dark: "#767676" },

        // Kebalikan dari latar: hover tombol yang "berbalik warna".
        inverse: { default: "gray.900", _dark: "white" },

        // Garis pemisah, dari yang paling tegas ke yang paling samar.
        borderStrong: { default: "gray.300", _dark: "gray.400" },
        border: { default: "gray.200", _dark: "gray.600" },
        borderMenu: { default: "gray.200", _dark: "gray.700" },
        borderSoft: { default: "blackAlpha.200", _dark: "whiteAlpha.300" },
        borderSubtle: { default: "blackAlpha.100", _dark: "whiteAlpha.200" },
        // Garis kolom layout desktop. Gelapnya gray.800 karena itulah warna
        // yang selama ini tampil (warna teks bawaan Chakra), bukan gray.400
        // yang tertulis di kode tapi tidak pernah berlaku.
        divider: { default: "gray.300", _dark: "gray.800" },

        // Sorotan: item belum dibaca, hover, dan item terpilih.
        subtle: { default: "blackAlpha.50", _dark: "whiteAlpha.100" },
        hover: { default: "blackAlpha.100", _dark: "whiteAlpha.200" },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "app.bg",
        color: "app.text",
      },
    },
  },
});

export default theme;
