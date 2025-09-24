// "use client";

// import { IOrder } from "@/types/order";
// import { Paper, Typography, Stack, Divider, Chip } from "@mui/material";

// export default function OrderCard({ order }: {order:IOrder}) {
//   return (
//     <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
//       <Stack spacing={2}>
//         <Typography variant="h6">
//           Order ID: {order._id}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Created At: {new Date(order.createdAt).toLocaleString()}
//         </Typography>

//         <Divider />

//         {/* Order Items */}
//         <Stack spacing={1}>
//           <Typography variant="subtitle1">Items:</Typography>
//           {order.orderItems.map((item, idx) => (
//             <Paper
//               key={idx}
//               variant="outlined"
//               sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
//             >
//               <Typography>Product: {item.productId.title}</Typography>
//               <Typography>Quantity: {item.quantity}</Typography>
//               <Typography>Price: ${item.price}</Typography>
//               {item.finalPrice && (
//                 <Typography>Final Price: ${item.finalPrice}</Typography>
//               )}
//             </Paper>
//           ))}
//         </Stack>

//         <Divider />

//         {/* Summary */}
//         <Stack spacing={1}>
//           <Typography>Tax: ${order.taxPrice}</Typography>
//           <Typography>Shipping: ${order.shippingPrice}</Typography>
//           <Typography>Total: ${order.totalOrderPrice}</Typography>
//           {order.discount > 0 && (
//             <Typography color="error">
//               Discount: -${order.discount} → After Discount: $
//               {order.totalOrderPriceAfterDiscount}
//             </Typography>
//           )}
//         </Stack>

//         <Divider />

//         {/* Payment & Delivery */}
//         <Stack direction="row" spacing={2} alignItems="center">
//           <Chip
//             label={`Payment: ${order.paymentMethodType}`}
//             color={order.isPaid ? "success" : "default"}
//           />
//           <Chip
//             label={order.isDelivered ? "Delivered" : "Not Delivered"}
//             color={order.isDelivered ? "success" : "warning"}
//           />
//         </Stack>
//         {order.isPaid && (
//           <Typography variant="body2">
//             Paid At: {new Date(order.paidAt as string).toLocaleString()}
//           </Typography>
//         )}
//         {order.isDelivered && (
//           <Typography variant="body2">
//             Delivered At: {new Date(order.deliveredAt as string).toLocaleString()}
//           </Typography>
//         )}
//       </Stack>
//     </Paper>
//   );
// }

"use client";

import { IOrder } from "@/types/order";
import { Paper, Typography, Stack, Divider, Chip, Box } from "@mui/material";
import Image from "next/image";

// interface Product {
//   _id: string;
//   name: string;
//   images?: string[];
// }

// interface OrderItem {
//   productId: Product; // populated product
//   quantity: number;
//   price: number;
//   finalPrice?: number;
// }

// interface Order {
//   _id: string;
//   user: string;
//   orderItems: OrderItem[];
//   taxPrice: number;
//   shippingPrice: number;
//   totalOrderPrice: number;
//   totalOrderPriceAfterDiscount: number;
//   discount: number;
//   tax: number;
//   shipping: number;
//   paymentMethodType: "cash" | "stripe" | "paypal" | "paymob";
//   isPaid: boolean;
//   paidAt?: string;
//   isDelivered: boolean;
//   deliveredAt?: string;
//   createdAt: string;
// }

// type Props = {
//   order: Order;
// };

export default function OrderCard({ order }: { order: IOrder }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "grey.50", // حل مشكلة الداكن
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">Order ID: {order._id}</Typography>
        <Typography variant="body2" color="text.secondary">
          Created At: {new Date(order.createdAt).toLocaleString()}
        </Typography>

        <Divider />

        {/* Order Items */}
        <Stack spacing={1}>
          <Typography variant="subtitle1">Items:</Typography>
          {order.orderItems.map((item, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.background.default
                    : "white",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                {/* صورة المنتج */}
                {item.productId?.images?.[0].url ? (
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={item.productId.images[0].url}
                      alt={item.productId.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={item.productOrderImage.url}
                      alt={item.productOrderTitle}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                )}

                {/* بيانات المنتج */}
                <Stack spacing={0.5}>
                  <Typography sx={{ fontSize: { xs: "14px", sm: "16px" } }}>
                    {item.productId?.title ?? item.productOrderTitle}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Price: ${item.finalPrice}
                  </Typography>
                  {/* {item.finalPrice && (
                    <Typography variant="body2">
                      Final Price: ${item.finalPrice}
                    </Typography>
                  )} */}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Divider />

        {/* Summary */}
        <Stack spacing={1}>
          <Typography>Tax: ${order.taxPrice}</Typography>
          <Typography>Shipping: ${order.shippingPrice}</Typography>
          <Typography>Total: ${order.totalOrderPrice}</Typography>
          {order.discount > 0 && (
            <Typography color="error">
              Discount: -${order.discount} → After Discount: $
              {order.totalOrderPriceAfterDiscount}
            </Typography>
          )}
        </Stack>

        <Divider />

        {/* Payment & Delivery */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={`Payment: ${order.paymentMethodType}`}
            color={order.isPaid ? "success" : "default"}
          />
          <Chip
            label={order.isDelivered ? "Delivered" : "Not Delivered"}
            color={order.isDelivered ? "success" : "warning"}
          />
        </Stack>
        {order.isPaid && (
          <Typography variant="body2">
            Paid At: {new Date(order.paidAt as string).toLocaleString()}
          </Typography>
        )}
        {order.isDelivered && (
          <Typography variant="body2">
            Delivered At:{" "}
            {new Date(order.deliveredAt as string).toLocaleString()}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
