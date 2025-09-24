"use client";
import SwipperComponent from "@/app/components/hero/SwipperComponent";
import { useGetBestSellerProductsQuery } from "@/redux/slices/api/productApiSlice";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ProductCard from "../products/_components/ProductCard";
import { useRouter } from "next/navigation";
import { createSearchKeywordAction } from "@/redux/slices/searchSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useState } from "react";

const HomePage = () => {
  const router = useRouter();
  const { data: products } = useGetBestSellerProductsQuery();
    const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      dispatch(createSearchKeywordAction(searchValue));
      router.push("/products");
    }
  };

  return (
    <>
      {/* Search + Actions */}
      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 12 },
          py: 4,
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          alignItems="flex-start"
        >
  
          <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 500,
        bgcolor: "background.paper",
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: 1,
      }}
    >
      {/* Input */}
      <InputBase
        placeholder="Search in shop ..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        sx={{
          flex: 1,
          px: 2,
          // py: 1,
        }}
      />

      {/* Search Button */}
      <IconButton
        onClick={handleSearch}
        sx={{
          bgcolor: "#f0c14b", // أصفر زي أمازون
          borderRadius: 0, // مربع عشان يبقى متصل بالبار
          px: 2,
          "&:hover": { bgcolor: "#ddb347" },
          height:"100%"
        }}
      >
        <SearchIcon sx={{ color: "black" }} />
      </IconButton>
    </Box>

          {/* Buttons */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "center", md: "flex-start" },
              mt: { xs: 1, md: 0 },
            }}
          >
<Button
  variant="contained"
  size="small"
  sx={{
    textTransform: "capitalize",
    borderRadius: 3,
    px: { xs: 2, md: 3 },
      py: { xs: 0.5, md: 0.9 },
    fontSize: { xs: 12,sm:13, md: 14 },
    width: { xs: "100%", md: "auto" }, // هنا بدل fullWidth
  }}
  onClick={() => router.push("/products")}
>
  Browse Products
</Button>

<Button
  variant="outlined"
  size="small"
  sx={{
    textTransform: "capitalize",
    borderRadius: 3,
    px: { xs: 2, md: 3 },
    py: { xs: 0.5, md: 0.9 },
    fontSize: { xs: 13, md: 14 },
    width: { xs: "100%", md: "auto" }, // هنا برضه
  }}
  onClick={() => router.push("/categories")}
>
  Browse Categories
</Button>

          </Stack>
        </Stack>
      </Box>

      {/* Slider */}
      <SwipperComponent />

      {/* Products Section */}
      <Box sx={{ my: 10, px: { xs: 2, sm: 4, md: 12 } }}>
        <Typography sx={{ mb: 3, ml: 4, fontSize: "24px" }}>
          Products
        </Typography>

        <Stack
          flexDirection={"row"}
          flexWrap={"wrap"}
          gap={4}
          justifyContent={"center"}
        >
          {products?.map((product) => (
            <ProductCard productInfo={product} key={product._id} />
          ))}
        </Stack>

        <Button
          onClick={() => router.push("/products")}
          sx={{
            display: "block",
            mx: "auto",
            mt: 5,
            fontSize: 17,
            textTransform: "capitalize",
          }}
        >
          More Products
        </Button>
      </Box>
    </>
  );
};

export default HomePage;
