"use client";

import { Container, Typography } from "@mui/material";
import OrderCard from "./_component/OrderCard";
import { useGetOrdersCurrentUserQuery } from "@/redux/slices/api/orderApiSlice";
import Loading from "@/app/loading";
import { ChangeEvent, useState } from "react";
import { Box } from "@mui/system";
import PaginationComponent from "@/app/components/PaginationComponent";

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: ordersResponse, isLoading } = useGetOrdersCurrentUserQuery(
    `?page=${currentPage}`
  );
console.log(ordersResponse?.orders);

  const handlePageChange = (_: ChangeEvent<unknown>, page: number) =>
    setCurrentPage(page);
  if (isLoading) {
    return <Loading />;
  }

  if (isLoading) {
    return <Loading />;
  }
  return (
    <>
      {ordersResponse?.orders && ordersResponse?.orders.length > 0 ? (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          {ordersResponse?.orders.map((order) => (
            <OrderCard order={order} key={order._id} />
          ))}
        </Container>
      ) : (
        <Container sx={{mt:5 ,textAlign:"center",pb:5}}>
          <Typography variant="h4" >No Orders yet</Typography>
        </Container>
      )}

      {/* Pagination */}
      {ordersResponse?.pagination &&
        ordersResponse.pagination.pagesCount > 1 && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <PaginationComponent
              count={ordersResponse.pagination.pagesCount}
              currentPage={ordersResponse.pagination.page}
              handlePageChange={handlePageChange}
            />
          </Box>
        )}
    </>
  );
}
