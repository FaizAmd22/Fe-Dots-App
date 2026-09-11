// SweetAlert dirender di luar pohon React, jadi tidak bisa memakai token tema
// Chakra. Tema aktif dibaca dari atribut data-theme yang dipasang Chakra di
// <html>, tepat saat popup dibuka.
export const swalTheme = () => {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";

  return isDark
    ? { background: "#2b2b2b", color: "white" }
    : { background: "#ffffff", color: "#18181B" };
};
