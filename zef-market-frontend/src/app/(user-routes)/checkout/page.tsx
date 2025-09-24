"use client";

import { useCreateOrderMutation } from "@/redux/slices/api/orderApiSlice";
import { Box, Button, Typography, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import CheckoutSteps from "../cart/_components/CheckoutSteps";
import { useAppDispatch } from "@/redux/hooks";
import { clearCart, setCartItemsLength } from "@/redux/slices/cartSlice";

export default function CheckoutPage() {
  const router = useRouter();
    const dispatch = useAppDispatch();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleCheckout = async (
    method: "cash" | "stripe" | "paypal" | "paymob"
  ) => {
    try {
      const order = await createOrder({ paymentMethodType: method }).unwrap();

      if (method === "cash") {
        // ✅ الدفع كاش -> روح لصفحة الأوردر
        router.push(`/orders/${order._id}`);
        dispatch(setCartItemsLength(0))
      } else if (method === "stripe") {
        // ✅ الدفع Stripe -> افتح صفحة الـ checkout
        if (order.url) {
          window.location.href = order.url;
        } else {
          console.error("Stripe checkout URL not found");
        }
      } else if (method === "paypal") {
        // ✅ الدفع PayPal -> حول المستخدم لصفحة PayPal
        if (order.redirectUrl) {
          window.location.href = order.redirectUrl;
        } else {
          console.error("PayPal redirect URL not found");
        }
      } else if (method === "paymob") {
        // ✅ الدفع Paymob -> افتح الـ Iframe/Redirect
        if (order.url) {
          window.location.href = order.url;
        } else {
          console.error("Paymob checkout URL not found");
        }
      }
    } catch (err) {
      console.error("createOrder error", err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Choose Payment Method
      </Typography>
      <CheckoutSteps activeStep={1} />
      <Stack spacing={2}>
        <Button
          variant="contained"
          color="primary"
          sx={{ textTransform: "capitalize" }}
          onClick={() => handleCheckout("cash")}
          disabled={isLoading}
        >
          Pay with Cash
        </Button>
        <Button
          variant="contained"
          sx={{ textTransform: "capitalize" }}
          color="secondary"
          onClick={() => handleCheckout("stripe")}
          disabled={isLoading}
        >
          Pay with card (Stripe)
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#0070ba", textTransform: "capitalize" }} // PayPal لون
          onClick={() => handleCheckout("paypal")}
          disabled={isLoading}
        >
          Pay with card (PayPal)
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#ff9800", textTransform: "capitalize" }} // Paymob لون
          onClick={() => handleCheckout("paymob")}
          disabled={isLoading}
        >
          Pay with card (Paymob)
        </Button>
      </Stack>
    </Box>
  );
}
