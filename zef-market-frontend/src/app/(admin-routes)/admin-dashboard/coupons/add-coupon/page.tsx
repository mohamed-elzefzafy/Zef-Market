"use client";
import { useCreateCategoryMutation } from "@/redux/slices/api/categoryApiSlice";
import { KeyboardDoubleArrowRight } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ChangeEvent, useState } from "react";
import { IAddCoupon } from "@/types/coupons";
import { useCreateCouponMutation } from "@/redux/slices/api/couponsApiSlice";

const AddCouponAdminPage = () => {
  const router = useRouter();
  const [createCoupon] = useCreateCouponMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<IAddCoupon>();

  const onSubmit = async (values: IAddCoupon) => {
    try {
      await createCoupon({
        name: values.name,
        expireDate: values.expireDate,
        discount: +values.discount,
      }).unwrap();

      toast.success("you have created coupon successfully");
      reset();
      setTimeout(() => {
        router.push(`/admin-dashboard/coupons`);
      }, 1000);
    } catch (error) {
      toast.error((error as { data: { message: string } })?.data?.message);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: { xs: "70%", md: "40%" },
        mx: "auto",
        height: { xs: "calc(100vh - 8rem)", sm: "calc(100vh - 9rem)" },
        mt: 10,
        display: "flex",
        alignItems: "center",
        justifyItems: "center",
        justifyContent: "flex-start",
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h2" sx={{ ml: 2 }}>
        Add coupon
        <Tooltip
          title={"back to Categories admin dashboard"}
          placement="right-end"
          enterDelay={200}
        >
          <IconButton
            onClick={() => router.push(`/admin-dashboard/categories`)}
          >
            <KeyboardDoubleArrowRight sx={{ color: "primary.main" }} />
          </IconButton>
        </Tooltip>
      </Typography>
      <TextField
        type="text"
        placeholder="name"
        label="name"
        sx={{ width: "100%" }}
        {...register("name", { required: "name is required" })}
        error={errors.name ? true : false}
        helperText={errors.name && "name is required"}
      />

      <TextField
        type="date"
        placeholder="Expire Date"
        label="Expire Date"
        sx={{ width: "100%" }}
        {...register("expireDate", { required: "Expire date is required" })}
        error={errors.expireDate ? true : false}
        helperText={errors.expireDate && "Expire date is required"}
      />

      <TextField
        type="number"
        placeholder="discount"
        label="discount"
        sx={{ width: "100%" }}
        {...register("discount", { required: "discount is required" })}
        error={errors.discount ? true : false}
        helperText={errors.discount && "discount is required"}
      />

      {/* <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2, textTransform: "capitalize", width: "100%" }}
        disabled={isSubmitting}
      >
        Add category 
      </Button> */}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        sx={{ textTransform: "capitalize", position: "relative" }}
      >
        {isSubmitting ? (
          <CircularProgress
            size={24}
            sx={{
              color: "white",
            }}
          />
        ) : (
          "Add coupon "
        )}
      </Button>
    </Stack>
  );
};

export default AddCouponAdminPage;
