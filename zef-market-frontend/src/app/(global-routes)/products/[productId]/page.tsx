"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  useGetOneProductQuery,
  useGetRelatedProductQuery,
} from "@/redux/slices/api/productApiSlice";
import {
  useCreateReviewMutation,
  useDeleteReviewByAdminMutation,
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useUpdateReviewMutation,
} from "@/redux/slices/api/reviewApiSlice";
import { IReview } from "@/types/review";
import {
  Box,
  Container,
  Typography,
  Button,
  Rating,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  useTheme,
  SelectChangeEvent,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BorderColor,
  Delete,
  DeleteForever,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import ProductCard from "../_components/ProductCard";
import { useAddToCartMutation } from "@/redux/slices/api/cartApiSlice";
import { setCartItemsLength } from "@/redux/slices/cartSlice";
import { useGetOneUserQuery } from "@/redux/slices/api/authApiSlice";
import {
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from "@/redux/slices/api/wislistApiSlice";
import { setCredentials } from "@/redux/slices/authSlice";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state?.auth);
  const { data: reviews, refetch } = useGetReviewsQuery(productId as string);

  const [createReview] = useCreateReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [deleteReviewByAdmin] = useDeleteReviewByAdminMutation();
  const [rating, setRating] = useState<number | string>("");
  const [comment, setComment] = useState("");

  const { data: user, refetch: refetchUser } = useGetOneUserQuery(userInfo._id);
  const [addProductToWishlist] = useAddProductToWishlistMutation();
  const [removeProductFromWishlist] = useRemoveProductFromWishlistMutation();

  const [addToCart] = useAddToCartMutation();

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch: refetchProduct,
  } = useGetOneProductQuery(productId as string);
  const { data: relatedProducts } = useGetRelatedProductQuery(
    productId as string
  );

  const productsRelated = relatedProducts?.filter(
    (prod) => prod._id !== product?._id
  );

  const [selectedImage, setSelectedImage] = useState(product?.images[0]?.url);
  useEffect(() => {
    setSelectedImage(product?.images[0]?.url);
  }, [product?.images]);

  const [reviewId, setReviewId] = useState("");

  const [showAddButtonState, setshowAddButtonState] = useState(false);
  const handleAddRating = (event: SelectChangeEvent<number>) => {
    setRating(Number(event.target.value));
  };
  const handleAddComment = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setComment(event.target.value);
  };

  const createReviewHandler = async () => {
    if (!product) {
      toast.error("Product is required");
      return;
    }
    if (!rating || rating === 0) {
      toast.error("rating is required");
      return;
    }
    if (!comment) {
      toast.error("comment is required");
      return;
    }

    try {
      await createReview({
        comment: comment.toString(),
        rating: Number(rating),
        product: product?._id as string,
      }).unwrap();
      setComment("");
      setRating(0);
      refetch();
      refetchProduct();
      toast.success("review added successfully");
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } }).data
        ?.message;
      toast.error(errorMessage as string);
    }
  };

  const updateReviewHandler = async (review: IReview) => {
    if (review.user._id === userInfo._id) {
      setComment(review.comment);
      setRating(review.rating);
    } else {
      setComment("");
      setRating(0);
    }
    setComment(review.comment);
    setRating(review.rating);
    setReviewId(review._id);
    setshowAddButtonState(true);
    console.log(comment, rating);
  };

  const updateReviewFunc = async () => {
    if (!product) {
      toast.error("ProductID is required");
      return;
    }
    if (!rating || rating === 0) {
      toast.error("rating is required");
      return;
    }
    if (!comment) {
      toast.error("comment is required");
      return;
    }
    try {
      await updateReview({
        reviewId,
        payLoad: { comment, rating },
      }).unwrap();
      toast.success("Review updated successfully");
      refetch();
      refetchProduct();
      router.refresh();
      setshowAddButtonState(false);
      setComment("");
      setRating(0);
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } }).data
        ?.message;
      toast.error(errorMessage as string);
      setshowAddButtonState(false);
    }
  };

  const deleteReviewHandler = async (reviewId: string) => {
    try {
      await deleteReview(reviewId).unwrap();
      refetch();
      refetchProduct();
      router.refresh();
      toast.success("Review deleted successfully");
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } }).data
        ?.message;
      toast.error(errorMessage as string);
    }
  };

  const deleteReviewByAdminHandler = async (reviewId: string) => {
    try {
      await deleteReviewByAdmin(reviewId).unwrap();
      refetch();
      refetchProduct();
      router.refresh();
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } }).data
        ?.message;
      toast.error(errorMessage as string);
    }
  };

  const addToCartHandler = async () => {
    if (!product) {
      return;
    }
    try {
      const res = await addToCart({
        productId: product._id,
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
      const user = await addProductToWishlist({ product: product?._id }).unwrap();
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
      const user = await removeProductFromWishlist(product?._id).unwrap();
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

  if (isLoading) {
    return (
      <Container sx={{ py: 5, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography color="error">
          Failed to load product details. {JSON.stringify(error)}
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography>No product found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 3, md: 6 } }}>
      {/* Main Flex Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {/* Left Side: Product Images */}
        <Box flex={1}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: { xs: 250, sm: 400, md: 500 },
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 2,
            }}
          >
            <Image
              src={selectedImage || product?.images[0]?.url}
              alt={product.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <Stack direction="row" spacing={2} mt={2} overflow="auto">
              {product.images.map((img) => (
                <Box
                  key={img.public_id}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 80,
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    border:
                      selectedImage === img.url
                        ? `3px solid ${theme.palette.primary.main}`
                        : "2px solid #eee",
                  }}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <Image
                    src={img.url}
                    alt={product.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Right Side: Product Info */}
        <Box flex={1}>
          <Stack spacing={2}>
            <Typography
              fontWeight="bold"
              sx={{
                fontSize: {
                  xs: "1.2rem",
                  sm: "1.5rem",
                  md: "2rem",
                  lg: "2.25rem",
                },
              }}
            >
              {product.title}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={product.rating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.reviewsNumber} reviews)
              </Typography>
            </Stack>

            <Typography variant="body1" color="text.secondary">
              {product.description}
            </Typography>

            <Divider />

            {/* Pricing */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${product.finalPrice}
              </Typography>
              {product.discount > 0 && (
                <>
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.secondary",
                    }}
                  >
                    ${product.price}
                  </Typography>
                  <Chip
                    label={`Save ${Math.round(
                      ((product.price - product.finalPrice) / product.price) *
                        100
                    )}%`}
                    color="success"
                    size="small"
                  />
                </>
              )}
            </Stack>

            {/* Details */}
            <Typography variant="body2">
              <strong>Stock:</strong>{" "}
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </Typography>
            <Typography variant="body2">
              <strong>Category:</strong> {product.category?.title}
            </Typography>
            <Typography variant="body2">
              <strong>SubCategory:</strong> {product.subCategory?.title}
            </Typography>
            {product.brand && (
              <Typography variant="body2">
                <strong>Brand:</strong> {product.brand?.title}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Sold:</strong> {product.sold}
            </Typography>

            {/* Buttons */}
            <Stack direction={{xs : "column",md:"row"}} spacing={2} mt={2} >
              <Button
                variant="contained"
                size="large"
                sx={{ borderRadius: "30px", px: {sx: 0.5 ,md:4} ,textTransform:"capitalize"}}
                onClick={addToCartHandler}
              >
                Add to Cart
              </Button>
              {/* <Button
                variant="outlined"
                size="large"
                sx={{ borderRadius: "30px", px: 4 }}
              >
                Buy Now
              </Button> */}

              {userInfo.email && userInfo.role === "user" && (
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ borderRadius: "30px" ,textTransform:"capitalize",  px: {sx: 0.5 ,md:4},mt:{xs : 2 , md:0}}}
                  endIcon={
                    user?.wishlist.find((w) => w._id === product._id) ? (
                      <Favorite
                        sx={{ color: "red" }}
                        onClick={handleRemoveProductFromWishlist}
                      />
                    ) : (
                      <FavoriteBorder
                        sx={{ color: "red" }}
                        onClick={handleAddProductToWishlist}
                      />
                    )
                  }
                >
            {user?.wishlist.find((w) => w._id === product._id) ? "remove from Wishlist": "Add To Wishlist"}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* reviews  */}

      <Divider sx={{mt:3}}/>

      <Box mt={5}>
        {reviews && reviews?.length > 0 ? (
          <Typography
            variant="h5"
            mb={2}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Chip label={`${product.title}`} color="success" size="medium" />{" "}
            Reviews
          </Typography>
        ) : (
          <Typography
            variant="h5"
            mb={2}
            textAlign={{ xs: "center", md: "left" }}
          >
            No Reviews for{" "}
            <Chip label={`${product.title}`} color="success" size="medium" />
          </Typography>
        )}
        <Divider />

        {reviews &&
          reviews.map((review) => (
            <Stack mt={2} key={review._id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    alt={review?.user?.firstName}
                    src={review?.user?.profileImage.url}
                  />
                  <Chip
                    label={review?.user?.firstName + " " + review?.user?.lastName}
                    size="medium"
                    color="warning"
                    sx={{ fontWeight: "bold" }}
                  />
                  {/* <Typography variant="body1">{review.user.firstName + " " + review.user.lastName}</Typography> */}
                </Box>
                <Box>
                  <Rating
                    name="read-only"
                    value={review?.rating}
                    readOnly
                    size="small"
                    sx={{ mt: 1 }}
                    precision={0.5}
                  />
                </Box>
              </Stack>

              <Typography
                variant="body1"
                color={theme.palette.error.dark}
                mt={1}
              >
                {review.createdAt.substring(0, 10)}
              </Typography>

              <Stack mt={1}>
                <Typography variant="body1">{review.comment}</Typography>
              </Stack>

              {(userInfo?.role === "admin" ||
                userInfo?._id === review.user?._id) && (
                <>
                  <Stack mt={2} mb={1} flexDirection="row" gap={2}>
                    {userInfo?._id === review.user?._id && (
                      <>
                        <Delete
                          sx={{
                            color: theme.palette.error.main,
                            cursor: "pointer",
                          }}
                          onClick={() => deleteReviewHandler(review?._id)}
                        />
                        <BorderColor
                          onClick={() => updateReviewHandler(review)}
                          sx={{
                            color: theme.palette.primary.main,
                            cursor: "pointer",
                          }}
                        />
                      </>
                    )}
                    {userInfo?.role === "admin" && (
                      <DeleteForever
                        sx={{
                          color: theme.palette.error.dark,
                          cursor: "pointer",
                        }}
                        onClick={() => deleteReviewByAdminHandler(review._id)}
                      />
                    )}
                  </Stack>

                  <Divider />
                </>
              )}
            </Stack>
          ))}

        {userInfo?.email && userInfo.role === "user" && (
          <Stack mt={2} component="form" alignItems="flex-start">
            <Typography variant="h6" mb={1}>
              Write a Review
            </Typography>
            <TextField
              type="text"
              placeholder="Write your review"
              sx={{ width: "100%" }}
              value={comment}
              onChange={handleAddComment}
            />
            <FormControl sx={{ minWidth: 200, width: "100%", mt: 2 }}>
              <InputLabel id="rating-label">Rating</InputLabel>
              <Select
                labelId="rating-label"
                value={rating as number}
                label="Rating"
                onChange={handleAddRating}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {[5, 4, 3, 2, 1].map((value) => (
                  <MenuItem key={value} value={value}>
                    <Rating
                      name="read-only"
                      value={value}
                      readOnly
                      size="small"
                      precision={0.5}
                    />{" "}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {showAddButtonState ? (
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: theme.palette.mainColor?.main,
                  color: "white",
                  textTransform: "capitalize",
                }}
                onClick={updateReviewFunc}
              >
                Update Review
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: theme.palette.mainColor?.main,
                  color: "white",
                  textTransform: "capitalize",
                }}
                onClick={createReviewHandler}
              >
                Add Review
              </Button>
            )}
          </Stack>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      {/* related products  */}
      <Box sx={{ mt: 7 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {productsRelated && productsRelated?.length > 0
            ? "Related Products"
            : "No Related Products Found"}
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: { xs: "center", md: "flex-start" },
            alignItems: "center",
          }}
        >
          {productsRelated?.map((product) => (
            <ProductCard key={product._id} productInfo={product} />
          ))}
        </Stack>
      </Box>
    </Container>
  );
}
