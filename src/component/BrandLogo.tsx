import { Box, Image, ImageProps } from "@chakra-ui/react";

const TEXT_LOGO = "/logos/logo-text-green.svg";
const MARK_LOGO = "/logos/logo-green.svg";

// Logo merek Dots, menggantikan teks "Dots." di seluruh aplikasi.
//
// `responsive` hanya dipakai navbar: di layar kecil ruangnya sempit, jadi
// cukup lambangnya saja. Di tempat lain selalu logo lengkap.
const BrandLogo = ({
  responsive = false,
  ...rest
}: { responsive?: boolean } & ImageProps) => {
  if (!responsive) {
    return <Image src={TEXT_LOGO} alt="Dots" w="auto" {...rest} />;
  }

  // <picture>, bukan dua <img> yang disembunyikan bergantian: browser hanya
  // mengunduh gambar yang cocok dengan lebar layar. 47.99em = di bawah
  // breakpoint md Chakra (48em), sama dengan batas navbar mobile.
  return (
    <Box as="picture" display="inline-flex">
      <source media="(max-width: 47.99em)" srcSet={MARK_LOGO} />
      <Image src={TEXT_LOGO} alt="Dots" w="auto" {...rest} />
    </Box>
  );
};

export default BrandLogo;
