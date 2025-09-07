"use client";

import { Box, Typography, Button } from "@mui/material";

export default function FailurePage() {
  return (
    <Box sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h4" color="error.main" fontWeight="bold">
        ❌ Payment Failed!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Something went wrong with your payment. Please try again.
      </Typography>
      <Button href="/cart" variant="contained" sx={{ mt: 4 }}>
        Back to Cart
      </Button>
    </Box>
  );
}
