"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useGetOneUserQuery } from "@/redux/slices/api/authApiSlice";
import { useAddToCartMutation } from "@/redux/slices/api/cartApiSlice";
import { useAddProductToWishlistMutation, useRemoveProductFromWishlistMutation } from "@/redux/slices/api/wislistApiSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import { setCartItemsLength } from "@/redux/slices/cartSlice";
import { IProduct } from "@/types/product";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
  Rating,
  Chip,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface IProductCardProps {
  productInfo: IProduct;
  refetchWishlist?: () => QueryActionCreatorResult<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    QueryDefinition<string | void, any, any, IProduct[], any>
  >;
  refetch? : ()=>void,
}
const ProductCard = ({
  productInfo: {
    category,
    title,
    description,
    images,
    price,
    discount,
    subCategory,
    finalPrice,
    rating,
    _id,
  },
  refetch,
  refetchWishlist,
}: IProductCardProps) => {
  const theme = useTheme();
  const router = useRouter();
    const dispatch = useAppDispatch();
      const { userInfo } = useAppSelector((state) => state?.auth);
      const { data: user,refetch: refetchUser } = useGetOneUserQuery(userInfo._id);
  const [addToCart] = useAddToCartMutation();
  const [addProductToWishlist] = useAddProductToWishlistMutation();
  const [removeProductFromWishlist] = useRemoveProductFromWishlistMutation();

    const addToCartHandler = async () => {
      if (!_id) {
        return;
      }
      try {
        const res = await addToCart({
          productId: _id,
          quantity: 1,
        }).unwrap();
        console.log(res?.cartItems?.length);
        dispatch(setCartItemsLength(res?.cartItems?.length));
      } catch (error) {
        const errorMessage = (error as { data?: { message?: string } }).data
          ?.message;
        toast.error(errorMessage as string);
      }
    };

      const handleAddProductToWishlist = async () => {
    try {
      const user = await addProductToWishlist({ product: _id }).unwrap();
      router.refresh();
      dispatch(setCredentials({ ...user }));
      // refetch();
      refetchUser();
    } catch (error) {
      console.error("add product to wishlist error:", error);
      const errorMessage =
        (error as { data?: { message?: string } }).data?.message ||
        "Failed to add product to wishlist";
      toast.error(errorMessage);
    }
  };


    const handleRemoveProductFromWishlist = async () => {
    try {
    const user =  await removeProductFromWishlist(_id).unwrap();
      router.refresh();
      dispatch(setCredentials({ ...user }));
      // refetch();
        refetchUser();
    } catch (error) {
      console.error("remove course from wishlist error:", error);
      const errorMessage =
        (error as { data?: { message?: string } }).data?.message ||
        "Failed to remove course from wishlist";
      toast.error(errorMessage);
    }
  };

    
  return (
    <Card
      sx={{
        maxWidth: 300,
        width: "100%",
        borderRadius: 3,
        boxShadow: 4,
        transition: "0.3s",
        "&:hover": { boxShadow: 8, transform: "translateY(-4px)" },
      }}
    >
      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={images?.[0]?.url || "/placeholder.png"}
        alt={title}
        sx={{
          objectFit: "cover",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
            cursor: "pointer",
        }}
           onClick={() => router.push(`/products/${_id}`)}
      />

      <CardContent>
        {/* Title */}
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 0.5 ,cursor: "pointer",}} onClick={() => router.push(`/products/${_id}`)}>
          {title}
        </Typography>

        {/* Category + SubCategory */}
        <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
          {category?.title && <Chip size="small" label={category.title} />}
          {subCategory?.title && (
            <Chip size="small" color="primary" label={subCategory.title} />
          )}
        </Stack>

  {/* Price */}
<Stack direction="row" spacing={1} alignItems="center" mb={1}>
  {price !== finalPrice && (
    <Typography
      variant="body2"
      sx={{ textDecoration: "line-through", color: "text.secondary" }}
    >
      ${price}
    </Typography>
  )}

  <Typography variant="h6" color={theme.palette.primary.main}>
    ${finalPrice}
  </Typography>

  {price !== finalPrice && (
    <Chip
      label={`-${Math.round(((price - finalPrice) / price) * 100)}%`}
      size="small"
      color="error"
    />
  )}
</Stack>

        {/* Rating */}
        <Stack direction="row" alignItems="center" justifyContent={"space-between"} spacing={0.5}>
        <Stack flexDirection={"row"} gap={1}>
            <Rating value={rating || 0} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            ({rating || 0})
          </Typography>
        </Stack>

                {(userInfo.email && userInfo.role === "user"  && (
                <Button>
                  {" "}
                  {user?.wishlist.find((w) => w._id === _id) ? (
                    <Favorite
                      sx={{ color: "red" }}
                      onClick={handleRemoveProductFromWishlist}
                    />
                  ) : (
                    <FavoriteBorder
                      sx={{ color: "red" }}
                      onClick={handleAddProductToWishlist}
                    />
                  )}{" "}
                </Button>
              ))}
        </Stack>

        {/* Actions */}
        <Box mt={2}>
          <Button variant="contained" color="primary" fullWidth onClick={addToCartHandler}>
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
