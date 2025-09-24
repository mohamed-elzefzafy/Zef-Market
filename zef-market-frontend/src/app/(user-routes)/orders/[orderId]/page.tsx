"use client";
import Loading from "@/app/loading";
import {
  useGetOrderByIdQuery,
  useToggleOrderToDeliverdStatueMutation,
  useToggleOrderToPaidStatueMutation,
} from "@/redux/slices/api/orderApiSlice";
import { Box, Card, Typography, Chip, Divider, Stack } from "@mui/material";
import Image from "next/image";
import { useParams } from "next/navigation";
import CheckoutSteps from "../../cart/_components/CheckoutSteps";
import { useAppSelector } from "@/redux/hooks";
import toast from "react-hot-toast";

export default function OrderPage() {
  const { orderId } = useParams(); // /orders/[id]
  const { userInfo } = useAppSelector((state) => state?.auth);
  const [toggleOrderToPaidStatue] = useToggleOrderToPaidStatueMutation();
  const [toggleOrderToDeliverdStatue] =
    useToggleOrderToDeliverdStatueMutation();
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useGetOrderByIdQuery(orderId as string);
  console.log(order);

  if (isLoading) return <Loading />;
  if (isError) return <Typography>Failed to load order</Typography>;
  if (!order) return <Typography>No order found</Typography>;

  const handlAdminToggleOrderToPaidStatue = async () => {
    if (!order) {
      return;
    }
    try {
      await toggleOrderToPaidStatue(order._id).unwrap();
      refetch();
      toast.success("order paid statue updated");
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } }).data
        ?.message;
      toast.error(errorMessage as string);
    }
  };

  const handlAdminToggleOrderToDeliverStatue = async () => {
    if (!order) {
      return;
    }
    try {
      await toggleOrderToDeliverdStatue(order._id).unwrap();
      refetch();
      toast.success("order deliver statue updated");
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } }).data
        ?.message;
      toast.error(errorMessage as string);
    }
  };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Order Details
      </Typography>

      <CheckoutSteps activeStep={2} />

      {/* Order Status */}
      {userInfo.role === "admin" && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip
            label={order.isPaid ? "make It not paid" : "make It paid"}
            color={"primary"}
            onClick={handlAdminToggleOrderToPaidStatue}
          />
          <Chip
            label={
              order.isDelivered ? "make It not delivered" : "make It delivered"
            }
            color={"primary"}
            onClick={handlAdminToggleOrderToDeliverStatue}
          />
        </Stack>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip
          label={order.isPaid ? "Paid" : "Not Paid"}
          color={order.isPaid ? "success" : "warning"}
        />
        <Chip
          label={order.isDelivered ? "Delivered" : "Not Delivered"}
          color={order.isDelivered ? "success" : "warning"}
        />
      </Stack>

      {/* Order Items */}
      {order.orderItems.map((item, idx) => (
        <Card
          key={`${item.productId}-${idx}`}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Image
            src={item.productId.images?.[0]?.url || "/no-image.png"}
            alt={item.productId.title || "Product"}
            width={100}
            height={100}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h6">{item.productId.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Qty: {item.quantity}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              ${item.finalPrice} × {item.quantity}
            </Typography>
          </Box>
        </Card>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Summary */}
      <Box>
        <Typography variant="h6">
          Total: ${order.totalOrderPriceAfterDiscount || order.totalOrderPrice}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Discount: ${order.discount} | Tax: {order.tax}% | Shipping: $
          {order.shipping}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Payment Method: {order.paymentMethodType}
        </Typography>
      </Box>
    </Box>
  );
}
