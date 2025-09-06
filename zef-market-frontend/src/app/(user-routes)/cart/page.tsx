// "use client";

// import {
//   Box,
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   CardMedia,
//   Stack,
//   Button,
//   Divider,
//   IconButton,
// } from "@mui/material";
// import { Delete, Add, Remove } from "@mui/icons-material";
// import Image from "next/image";
// import { useGetCurrentUserCartQuery } from "@/redux/slices/api/cartApiSlice";
// import Loading from "@/app/loading";
// import { useRouter } from "next/navigation";

// export default function CartPage() {
//   const router = useRouter();
//   const { data: cart, isLoading, isError } = useGetCurrentUserCartQuery();

//   if (isLoading) return <Loading/>;
//   if (isError || !cart) return <Typography>Error loading cart</Typography>;

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
//       <Typography
//         variant="h4"
//         fontWeight="bold"
//         gutterBottom
//         sx={{ textAlign: { xs: "center", md: "left" } }}
//       >
//         Your Cart
//       </Typography>

//       <Stack spacing={3}>
//         {/* cart items */}
//         { cart && cart.cartItems?.map((item) => (
//           <Card
//             key={item?.productId?._id}
//             sx={{
//               display: "flex",
//               flexDirection: { xs: "column", sm: "row" },
//               borderRadius: 3,
//               boxShadow: 3,
//             }}
//           >
//             {/* image */}
//             <CardMedia
//               sx={{
//                 position: "relative",
//                 width: { xs: "100%", sm: 180 },
//                 height: { xs: 200, sm: 180 },
//               }}
//             >
//               <Image
//                 // src={item.productId.images[0]?.url || "/no-image.png"}
//                 src={item?.productId?.images?.[0]?.url || "/no-image.png"}
//                 alt={item.productId.title}
//                 fill
//                 style={{ objectFit: "cover", borderRadius: "12px 0 0 12px" }}
//               />
//             </CardMedia>

//             {/* details */}
//             <CardContent
//               sx={{
//                 flex: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "space-between",
//               }}
//             >
//               <Box>
//                 <Typography variant="h6" fontWeight="600">
//                   {item.productId.title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" noWrap>
//                   {item.productId.description}
//                 </Typography>
//               </Box>

//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//                 mt={2}
//               >
//                 <Typography variant="h6" color="primary">
//                   ${item.finalPrice || item.price}
//                 </Typography>

//                 <Stack direction="row" spacing={1} alignItems="center">
//                   <IconButton size="small" color="primary">
//                     <Remove />
//                   </IconButton>
//                   <Typography>{item.quantity}</Typography>
//                   <IconButton size="small" color="primary">
//                     <Add />
//                   </IconButton>
//                 </Stack>

//                 <IconButton color="error">
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </CardContent>
//           </Card>
//         ))}

//         <Divider />

//         {/* summary */}
//         <Box
//           sx={{
//             p: 3,
//             borderRadius: 3,
//             boxShadow: 3,
//             textAlign: "center",
//             bgcolor: "background.paper",
//           }}
//         >
//           <Typography variant="h6" fontWeight="bold">
//             Order Summary
//           </Typography>
//           <Stack
//             direction="row"
//             justifyContent="space-between"
//             sx={{ my: 2 }}
//           >
//             <Typography>Total:</Typography>
//             <Typography fontWeight="600">${cart.totalPrice}</Typography>
//           </Stack>

//           {cart.totalPriceAfterDiscount && (
//             <Stack
//               direction="row"
//               justifyContent="space-between"
//               sx={{ mb: 2 }}
//             >
//               <Typography>After Discount:</Typography>
//               <Typography fontWeight="600" color="success.main">
//                 ${cart.totalPriceAfterDiscount}
//               </Typography>
//             </Stack>
//           )}

//           <Button
//             variant="contained"
//             color="primary"
//             size="large"
//             fullWidth
//             sx={{ borderRadius: 2, mt: 2 }}
//             onClick={() => router.push('/checkout')}
//           >
//             Proceed to Checkout
//           </Button>
//         </Box>
//       </Stack>
//     </Container>
//   );
// }









"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Button,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { Delete, Add, Remove } from "@mui/icons-material";
import Image from "next/image";
import {
  useGetCurrentUserCartQuery,
  useApplyCouponToCartMutation,
} from "@/redux/slices/api/cartApiSlice";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import CheckoutSteps from "./_components/CheckoutSteps";

interface CouponForm {
  couponName: string;
}

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading, isError } = useGetCurrentUserCartQuery();
  const [applyCouponToCart, { isLoading: applying }] = useApplyCouponToCartMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CouponForm>();


  if (isLoading) return <Loading />;
  if (isError || !cart) return <Typography>Error loading cart</Typography>;

  const onApplyCoupon = async (data: CouponForm) => {
    try {
      await applyCouponToCart({ couponName: data.couponName }).unwrap();
      toast.success("Coupon applied successfully! 🎉");
      reset();
    } catch (error) {
      toast.error((error as { data: { message: string } })?.data?.message);
    }
  };

  // 🟢 حساب قيمة الخصم (لو فيه totalPriceAfterDiscount)
  const discountAmount =
    cart.totalPriceAfterDiscount && cart.totalPrice
      ? cart.totalPrice - cart.totalPriceAfterDiscount
      : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6,pt:2 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ textAlign: { xs: "center", md: "left" } }}
      >
        Your Cart
      </Typography>

      <CheckoutSteps activeStep={0} />

      <Stack spacing={3}>
        {/* cart items */}
        {cart.cartItems?.map((item) => (
          <Card
            key={item?.productId?._id}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            {/* image */}
            <CardMedia
              sx={{
                position: "relative",
                width: { xs: "100%", sm: 180 },
                height: { xs: 200, sm: 180 },
              }}
            >
              <Image
                src={item?.productId?.images?.[0]?.url || "/no-image.png"}
                alt={item.productId.title}
                fill
                style={{ objectFit: "cover", borderRadius: "12px 0 0 12px" }}
              />
            </CardMedia>

            {/* details */}
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {item.productId.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.productId.description}
                </Typography>
              </Box>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Typography variant="h6" color="primary">
                  ${item.finalPrice || item.price}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton size="small" color="primary">
                    <Remove />
                  </IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton size="small" color="primary">
                    <Add />
                  </IconButton>
                </Stack>

                <IconButton color="error">
                  <Delete />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Divider />

        {/* coupon form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onApplyCoupon)}
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Apply Coupon
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Enter Coupon Code"
              fullWidth
              {...register("couponName", {
                required: "Coupon code is required",
              })}
              error={!!errors.couponName}
              helperText={errors.couponName?.message}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={applying}
            >
              {applying ? "Applying..." : "Apply"}
            </Button>
          </Stack>
          {/* {message && (
            <Typography mt={2} color="primary">
              {message}
            </Typography>
          )} */}
        </Box>

        {/* summary */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Order Summary
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ my: 2 }}
          >
            <Typography>Total:</Typography>
            <Typography fontWeight="600">${cart.totalPrice}</Typography>
          </Stack>

          {discountAmount > 0 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography>Discount:</Typography>
              <Typography fontWeight="600" color="success.main">
                -${discountAmount}
              </Typography>
            </Stack>
          )}

          {cart.totalPriceAfterDiscount && (
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography>After Discount:</Typography>
              <Typography fontWeight="600" color="success.main">
                ${cart.totalPriceAfterDiscount}
              </Typography>
            </Stack>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ borderRadius: 2, mt: 2 }}
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}


