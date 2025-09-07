"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import axiosRequest from "@/utils/request";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // PayPal orderId
  const payerId = searchParams.get("PayerID");
console.log("token", token);

  useEffect(() => {
    if (token) {
      axiosRequest.post(`/api/v1/paypal/capture/${token}`, {}, {
        withCredentials: true, // عشان يبعث الكوكي لو بتستخدم JWT cookies
      })
        .then((res) => {
          console.log("✅ Payment captured:", res.data);
        })
        .catch((err) => console.error("❌ Error capturing:", err));
    }
  }, [token, payerId]);

  return <h1>Payment Successful ✅</h1>;
}
