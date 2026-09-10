import { Box, Grid, Image } from "@chakra-ui/react";
import { darkenOnHover } from "./HoverStyles";

// Menampilkan 1-4 gambar dalam satu petak, dan meneruskan indeks yang diklik
// supaya pratinjau langsung membuka gambar yang dipilih.
const ImageGrid = ({
  images,
  onOpen,
  ...rest
}: {
  images: string[];
  onOpen: (index: number) => void;
  [key: string]: unknown;
}) => {
  if (!images.length) return null;

  const single = images.length === 1;

  return (
    <Grid
      gap="2"
      // Satu gambar tampil apa adanya; lebih dari itu dibuat dua kolom
      // supaya tinggi kartunya tidak membengkak.
      templateColumns={single ? "1fr" : "repeat(2, 1fr)"}
      {...rest}
    >
      {images.map((image, index) => (
        <Box
          key={image + index}
          rounded="md"
          overflow="hidden"
          cursor="pointer"
          {...darkenOnHover}
          onClick={(e) => {
            // Gambar sering berada di dalam link ke halaman detail.
            e.preventDefault();
            e.stopPropagation();
            onOpen(index);
          }}
        >
          <Image
            src={image}
            alt=""
            w="100%"
            maxH={single ? "400px" : "200px"}
            h={single ? "auto" : "200px"}
            objectFit={single ? "contain" : "cover"}
          />
        </Box>
      ))}
    </Grid>
  );
};

export default ImageGrid;
