"use client";
import { Container, Stack } from "@mui/system";
import { Typography } from "@mui/material";
import { useGetBrandsQuery } from "@/redux/slices/api/brandApiSlice";
import BrandCard from "./_components/BrandCard";

const BrandsPage = () => {
  const { data: brandsResponse } = useGetBrandsQuery();

  
  return (
    <Container>
      <Typography variant="h4" sx={{mb:3,mt:5}}>Brands</Typography>
<Stack flexDirection={"row"} sx={{gap:2}} flexWrap={"wrap"}>
        {brandsResponse?.brands.map((brand) => (
        <BrandCard
          key={brand._id}
          title={brand.title}
          imageUrl={brand.image.url}
          _id={brand._id}
        />
      ))}
</Stack>
    </Container>
  );
};

export default BrandsPage;
