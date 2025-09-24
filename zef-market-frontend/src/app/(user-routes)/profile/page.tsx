"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  useUpdateUserAddressMutation,
  useUpdateUserMutation,
} from "@/redux/slices/api/authApiSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import { IUserAddresses, IUserUpdate } from "@/types/auth";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Container } from "@mui/system";

const ProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state?.auth);
  const [updateUser] = useUpdateUserMutation();
  const [updateUserAddress] = useUpdateUserAddressMutation();
  const [profileImage, setProfileImage] = useState<File | null>();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImage(e.target.files[0]);
    }
  };
  const fromCartPage = searchParams.get("from-cart-complete-address");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<IUserUpdate>();

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    reset: reset2,
    formState: { isSubmitting: isSubmitting2, errors: errors2 },
  } = useForm<IUserAddresses>();

  const onSubmit = async (values: IUserUpdate) => {
    const formData = new FormData();
    formData.append("firstName", values.firstName || "");
    formData.append("lastName", values.lastName || "");
    if (values.password) {
      formData.append("password", values.password);
    } else if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const user = await updateUser(formData).unwrap();
      toast.success("Profile updated successfully");
      dispatch(setCredentials({ ...user }));
      reset();
      setProfileImage(null);
      // setTimeout(() => {
      //   router.push(`/profile/${userInfo._id}`);
      // }, 2000);
    } catch (error) {
      toast.error((error as { data: { message: string } })?.data?.message);
    }
  };

  const onSubmitAdressData = async (values: IUserAddresses) => {
    try {
      const user = await updateUserAddress(values).unwrap();
      toast.success("Adress updated successfully");
      dispatch(setCredentials({ ...user }));
      reset2();
      // setTimeout(() => {
      //   router.push(`/profile/${userInfo._id}`);
      // }, 2000);
    } catch (error) {
      toast.error((error as { data: { message: string } })?.data?.message);
    }
  };

  return (
    <Container sx={{ flexGrow: 1, mt: 5 }}>
      <Stack
        direction={{ xs: "column", md: "row-reverse" }}
        spacing={4}
        sx={{
          justifyContent: "center",
          alignItems: { xs: "center", md: "flex-start" },
        }}
      >
        {/* Form 1 */}
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            flex: 1,
            maxWidth: { xs: "90%", sm: "90%", md: "50%" },
            width: "90%",
            mx: "auto",
            gap: 2,
            alignItems: "center",
          }}
        >
          {fromCartPage && (
            <Chip
              label="return to cart page"
              onClick={() => router.push("/cart")}
              color="warning"
              sx={{ mt: 1, fontWeight: "bold" }}
            />
          )}
          <Typography
            variant="h6"
            component="h2"
            sx={{ mt: fromCartPage ? 0 : 2 }}
          >
            {userInfo.firstName} Profile
          </Typography>
          <TextField
            type="text"
            placeholder="first-name"
            defaultValue={userInfo?.firstName}
            label="First name"
            sx={{ width: "100%" }}
            {...register("firstName", { required: "First name is required" })}
            error={!!errors.firstName}
            helperText={errors.firstName && "First name is required"}
          />
          <TextField
            type="text"
            placeholder="last-name"
            defaultValue={userInfo?.lastName}
            label="Last name"
            sx={{ width: "100%" }}
            {...register("lastName", { required: "Last name is required" })}
            error={!!errors.lastName}
            helperText={errors.lastName && "Last name is required"}
          />
          <TextField
            type="text"
            defaultValue={userInfo.email}
            label="Email"
            sx={{ width: "100%" }}
            disabled
          />
          {profileImage ? (
            <Image
              src={URL.createObjectURL(profileImage)}
              width={200}
              height={200}
              style={{ objectFit: "contain", borderRadius: "5px" }}
              alt="profileImage"
            />
          ) : userInfo.profileImage?.url ? (
            <Image
              src={userInfo.profileImage.url}
              width={200}
              height={200}
              style={{ objectFit: "contain", borderRadius: "5px" }}
              alt="profileImage"
            />
          ) : null}
          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{ textTransform: "capitalize" }}
            startIcon={<ImageIcon />}
          >
            {profileImage ? "Image selected" : "Upload image"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{ textTransform: "capitalize", position: "relative" }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Update"
            )}
          </Button>
        </Stack>

        {/* Form 2 */}
        <Stack
          component="form"
          onSubmit={handleSubmit2(onSubmitAdressData)}
          sx={{
            flex: 1,
            maxWidth: { xs: "90%", sm: "80%", md: "50%" },
            width: "90%",
            mx: "auto",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
            {userInfo.firstName} Addresses
          </Typography>
          <TextField
            type="text"
            placeholder="Country"
            defaultValue={userInfo?.country}
            label="Country"
            sx={{ width: "100%" }}
            {...register2("country", { required: "Country is required" })}
            error={!!errors2.country}
            helperText={errors2.country && "Country is required"}
          />
          <TextField
            type="text"
            placeholder="City"
            defaultValue={userInfo?.city}
            label="City"
            sx={{ width: "100%" }}
            {...register2("city", { required: "City is required" })}
            error={!!errors2.city}
            helperText={errors2.city && "City is required"}
          />
          <TextField
            type="text"
            placeholder="Address"
            defaultValue={userInfo?.address}
            label="Address"
            sx={{ width: "100%" }}
            {...register2("address", { required: "Address is required" })}
            error={!!errors2.address}
            helperText={errors2.address && "Address is required"}
          />
          <TextField
            type="text"
            placeholder="Phone number"
            defaultValue={userInfo?.phoneNumber}
            label="Phone number"
            sx={{ width: "100%" }}
            {...register2("phoneNumber", {
              required: "Phone number is required",
            })}
            error={!!errors2.phoneNumber}
            helperText={errors2.phoneNumber && "Phone number is required"}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting2}
            sx={{ textTransform: "capitalize", position: "relative" }}
          >
            {isSubmitting2 ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Update Address"
            )}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default ProfilePage;
