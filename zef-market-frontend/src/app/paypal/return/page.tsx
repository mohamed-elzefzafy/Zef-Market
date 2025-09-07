/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function PaypalReturnPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get("token") ?? params?.get("orderId"); // safety: different param names
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing PayPal token");
      setLoading(false);
      return;
    }

    const capture = async () => {
      try {
        // POST to your backend capture endpoint
        // adjust base URL if needed (NEXT_PUBLIC_API_BASE_URL)
        const base = process.env.NEXT_PUBLIC_API_URL ?? "";
        const resp = await fetch(`${base}/paypal/capture/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await resp.json();

        if (!resp.ok) {
          console.error("Capture failed", data);
          setError(data?.message || "Capture failed");
          setLoading(false);
          return;
        }

        // backend should return created order or success info
        // if it returns order with _id -> go to order page
        if (data?._id) {
          router.push(`/orders/${data._id}`);
        } else {
          // otherwise go to a generic success page
          router.push("/orders/success");
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Unexpected error");
        setLoading(false);
      }
    };

    capture();
  }, [token, router]);

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Processing PayPal payment...</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography color="error">Payment failed: {error}</Typography>
    </Box>
  );
}
