"use client";
import { Container, Stack } from "@mui/system";
import React from "react";
import CategoryCard from "./_components/CategoryCard";
import { useGetCategoriesQuery } from "@/redux/slices/api/categoryApiSlice";
import { Typography } from "@mui/material";

const CategoriesPage = () => {
  const { data: categoriesResponse } = useGetCategoriesQuery();
  return (
    <Container>
      <Typography variant="h4" sx={{my:3}}>Categories</Typography>
<Stack flexDirection={"row"} sx={{gap:2}} flexWrap={"wrap"}>
        {categoriesResponse?.categories.map((category) => (
        <CategoryCard
          key={category._id}
          title={category.title}
          imageUrl={category.image.url}
          _id={category._id}
        />
      ))}
</Stack>
    </Container>
  );
};

export default CategoriesPage;
