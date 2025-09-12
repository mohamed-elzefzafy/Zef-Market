"use client";
import ProductCard from "@/app/(global-routes)/products/_components/ProductCard";
import PaginationComponent from "@/app/components/PaginationComponent";
import Loading from "@/app/loading";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyWishlistQuery } from "@/redux/slices/api/wislistApiSlice";
import { Box, Container, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

const MyWishlistPage = () => {
  const { userInfo } = useAppSelector((state) => state?.auth);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: wishlistResponse,
    isLoading,
    refetch,
  } = useGetMyWishlistQuery();

  useEffect(() => {
    refetch();
  }, [refetch, userInfo?.wishlist]);

  const handlePageChange = (_: ChangeEvent<unknown>, page: number) =>
    setCurrentPage(page);
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container sx={{ textAlign: "center", pt: 3 }}>
      {wishlistResponse?.wishlist && wishlistResponse?.wishlist.length > 0 ? (
        <Typography sx={{ my: 5 }} variant="h4">
          My Wishlist
        </Typography>
      ) : (
        <Typography sx={{ my: 5 }} variant="h4">
          You don&apos;t have wishlist Products
        </Typography>
      )}
    
          <Box
            sx={{
              flex: {
                xs: "1 0 100%",
                sm: "1 0 50%",
                md: "1 0 33.33%",
                lg: "1 0 25%",
              },
              display: "flex",
              flexDirection: "row",
              flexWrap:"wrap",
              gap:5,
              justifyContent:"center",
              alignItems : "center",
            }}
          >
              {wishlistResponse?.wishlist &&
        wishlistResponse.wishlist.map((product) => (
            <ProductCard
              productInfo={product}
              key={product._id}
              refetch={refetch}
            />
        
        ))}
  </Box>
      {/* Pagination */}
      {wishlistResponse?.pagination &&
        wishlistResponse.pagination.pagesCount > 1 && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <PaginationComponent
              count={wishlistResponse.pagination.pagesCount}
              currentPage={wishlistResponse.pagination.page}
              handlePageChange={handlePageChange}
            />
          </Box>
        )}
    </Container>
  );
};

export default MyWishlistPage;
