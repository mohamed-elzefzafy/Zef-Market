"use client";

import { useSearchParams } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";

export default function SuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <Box sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h4" color="success.main" fontWeight="bold">
        ✅ Payment Successful!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Your order ID is: {orderId}
      </Typography>
      <Button
        href="/orders"
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
      >
        View My Orders
      </Button>
    </Box>
  );
}
