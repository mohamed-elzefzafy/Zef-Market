/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useCreateOrderMutation } from "@/redux/slices/api/orderApiSlice";
// import { Box, Button, Typography, Stack } from "@mui/material";
// import { useRouter } from "next/navigation";
// import CheckoutSteps from "../cart/_components/CheckoutSteps";

// export default function CheckoutPage() {
//   const router = useRouter();
//   const [createOrder, { isLoading }] = useCreateOrderMutation();

//   const handleCheckout = async (method: "cash" | "card") => {
//     try {
//       const order = await createOrder({ paymentMethodType: method }).unwrap();

//       if (method === "cash") {
//         router.push(`/orders/${order._id}`); // go to OrderPage
//       } else if (method === "card") {
//         window.location.href = order.url; // Stripe checkout URL
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h5" sx={{ mb: 2 }}>
//         Choose Payment Method
//       </Typography>
//         <CheckoutSteps activeStep={1} />
//       <Stack spacing={2}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => handleCheckout("cash")}
//           disabled={isLoading}
//         >
//           Pay with Cash
//         </Button>
//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => handleCheckout("card")}
//           disabled={isLoading}
//         >
//           Pay with Card
//         </Button>
//       </Stack>
//     </Box>
//   );
// }



// app/(your)/checkout/page.tsx   أو components/CheckoutPage.tsx
// "use client";

// import React from "react";
// import { useCreateOrderMutation } from "@/redux/slices/api/orderApiSlice";
// import { Box, Button, Typography, Stack } from "@mui/material";
// import { useRouter } from "next/navigation";
// import CheckoutSteps from "../cart/_components/CheckoutSteps";

// type Method = "cash" | "stripe" | "paypal" | "paymob";

// export default function CheckoutPage() {
//   const router = useRouter();
//   const [createOrder, { isLoading }] = useCreateOrderMutation();

//   // حاول نستخرج رابط الدفع من شكل response مختلف
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const extractRedirectUrl = (res: any): string | null => {
//     if (!res) return null;
//     if (typeof res === "string") return res;
//     if (res.redirectUrl) return res.redirectUrl;
//     if (res.checkoutUrl) return res.checkoutUrl;
//     if (res.url) return res.url;
//     if (res.links && Array.isArray(res.links)) {
//       const approve = res.links.find(
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         (l: any) =>
//           l.rel === "approve" ||
//           l.rel === "approval_url" ||
//           l.rel === "checkout" ||
//           l.rel === "checkout_session"
//       );
//       if (approve) return approve.href || approve.href;
//     }
//     if (res.result && res.result.links) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const approve = res.result.links.find((l: any) => l.rel === "approve");
//       if (approve) return approve.href;
//     }
//     return null;
//   };

//   const handleCheckout = async (method: Method) => {
//     try {
//       // backend expects: 'cash' | 'stripe' | 'paypal' | 'paymob'
//       const payload = { paymentMethodType: method === "stripe" ? "stripe" : method };
//       const res = await createOrder(payload).unwrap();

//       // if cash -> backend returns order doc
//       if (res?._id) {
//         router.push(`/orders/${res._id}`);
//         return;
//       }

//       // try extract redirect url (stripe/paypal/paymob)
//       const redirectUrl = extractRedirectUrl(res) ?? extractRedirectUrl(res?.data) ?? null;

//       if (!redirectUrl) {
//         // لو مفيش redirectUrl، ممكن backend يرجّع object خاص بالـ PayPal (links)
//         // حاول نعمل check لنفس الاستجابة:
//         if (res?.links) {
//           const link = res.links.find((l: any) => l.rel === "approve")?.href;
//           if (link) window.location.href = link;
//           else console.error("No approval link found in response:", res);
//           return;
//         }

//         console.error("No redirect URL returned from server", res);
//         return;
//       }

//       // للـ iframe (Paymob) ممكن تفتح في نفس الصفحة أو نافذة جديدة
//       // الخيار الأبسط:
//       window.location.href = redirectUrl;
//     } catch (err) {
//       console.error("createOrder error", err);
//     }
//   };

//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h5" sx={{ mb: 2 }}>
//         Choose Payment Method
//       </Typography>
//       <CheckoutSteps activeStep={1} />
//       <Stack spacing={2}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => handleCheckout("cash")}
//           disabled={isLoading}
//         >
//           Pay with Cash
//         </Button>

//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => handleCheckout("stripe")}
//           disabled={isLoading}
//         >
//           Pay with Card (Stripe)
//         </Button>

//         <Button
//           variant="contained"
//           color="info"
//           onClick={() => handleCheckout("paypal")}
//           disabled={isLoading}
//         >
//           Pay with PayPal
//         </Button>

//         <Button
//           variant="contained"
//           color="warning"
//           onClick={() => handleCheckout("paymob")}
//           disabled={isLoading}
//         >
//           Pay with Paymob
//         </Button>
//       </Stack>
//     </Box>
//   );
// }



"use client";

import { useCreateOrderMutation } from "@/redux/slices/api/orderApiSlice";
import { Box, Button, Typography, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import CheckoutSteps from "../cart/_components/CheckoutSteps";

export default function CheckoutPage() {
  const router = useRouter();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleCheckout = async (method: "cash" | "card" | "paypal") => {
    try {
      const order = await createOrder({ paymentMethodType: method }).unwrap();

      if (method === "cash") {
        // ✅ الدفع كاش -> روح لصفحة الأوردر
        router.push(`/orders/${order._id}`);
      } else if (method === "card") {
        // ✅ الدفع Stripe -> افتح صفحة الـ checkout
        window.location.href = order.url;
      } else if (method === "paypal") {
        // ✅ الدفع PayPal -> حول المستخدم لصفحة PayPal
        const { redirectUrl } = order;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          console.error("PayPal redirect URL not found");
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
          onClick={() => handleCheckout("cash")}
          disabled={isLoading}
        >
          Pay with Cash
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleCheckout("card")}
          disabled={isLoading}
        >
          Pay with Card (Stripe)
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#0070ba" }} // لون PayPal
          onClick={() => handleCheckout("paypal")}
          disabled={isLoading}
        >
          Pay with PayPal
        </Button>
      </Stack>
    </Box>
  );
}
