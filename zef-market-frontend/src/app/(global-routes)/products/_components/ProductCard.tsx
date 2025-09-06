// import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';

// import Typography from '@mui/material/Typography';
// import { Button, IconButton, Rating, Stack } from '@mui/material';
// import { Favorite, FavoriteBorderOutlined } from '@mui/icons-material';
// import { QueryDefinition } from '@reduxjs/toolkit/query';
// import { QueryActionCreatorResult } from '@reduxjs/toolkit/query';
// // import { useState } from 'react';
// import toast from 'react-hot-toast';
// import { IProduct } from '@/types/product';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { useRouter } from 'next/navigation';
// import { Box } from '@mui/system';

// interface IProductCardProps {
//   productInfo : IProduct,
//   refetchWishlist ?: () => QueryActionCreatorResult<QueryDefinition<string | void, any, any, IProduct[], any>>
// }
// const  ProductCard = ({productInfo : {category , title , description , images , price,discount , subCategory,finalPrice, rating , _id} , refetchWishlist} : IProductCardProps) => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
// // const [toggleWishlist] = useToggleWishlistMutation();
//   const { userInfo } = useAppSelector((state) => state?.auth);

// // const [addToCart] = useAddToCartMutation();

// // const addToCartHandler = async () => {
// //   try {
// //    const res = await addToCart({ productId : _id, quantity: 1 }).unwrap();
// //     console.log(res?.cartItems?.length);
// //     dispatch(setCartItemLength(res?.cartItems?.length))

// //   } catch (error) {
// //     const errorMessage = (error as { data?: { message?: string } }).data
// //       ?.message;
// //     toast.error(errorMessage as string);
// //   }
// // };

// // const onToggleWishlistHandler = async() => {
// //   try {
// //     const res = await toggleWishlist({productId: _id}).unwrap();
// //     dispatch(setCredentials(res));
// //     if (refetchWishlist) {

// //       refetchWishlist();
// //       console.log(res);
// //     }
// //   } catch (error) {
// //     // Handle error
// //   }
// // }

//   return (
//     <Card  sx={{ width: 250 }}>
//       <CardMedia
//         component="img"
//         alt="green iguana"
//         height="140"
//         width={"100%"}
//         image={images[0]?.url}
//         sx={{cursor: "pointer"}}
//         onClick={() => router.push(`/products/${_id}`)}
//       />
//       <CardContent sx={{pb:0 , cursor :"pointer"}} onClick={() => router.push(`/products/${_id}`)} >
//         <Typography gutterBottom variant="h5" component="div">
//           {title}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//         {description}
//         </Typography>
//         <Stack sx={{flexDirection : "row" , justifyContent : "space-between" , alignItems : "center" , mt : 1}}>
//           <Typography variant="body1" >Price</Typography>
//         <Stack flexDirection="row" justifyContent={"center"} alignItems={"center"} gap={1}>
//             { discount > 0 && <Typography variant="body1" sx={{textDecoration: "line-through",   color: "text.disabled"}}>{price} </Typography>}
//           <Typography variant="body1" >{finalPrice} $</Typography>
//         </Stack>
//         </Stack>
//       <Stack  direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
//       <Rating name="read-only" value={rating} readOnly size='small' sx={{mt : 1}} precision={0.5}/>
//       <Typography variant="body1" fontSize={"13px"}> {category.title}</Typography>
//       </Stack>
//       </CardContent>
//       <CardActions sx={{justifyContent : "space-between"}}>
//         {/* <Button  onClick={addToCartHandler} >Add to cart</Button> */}
//      {/* <IconButton onClick={onToggleWishlistHandler}>
//      {userInfo.wishList.find(p => p._id === _id) ?   <Favorite color="error"/>  : <FavoriteBorderOutlined/>}
//      </IconButton> */}
//       </CardActions>
//     </Card>
//   );
// }

// export default ProductCard;

"use client";

import { IProduct } from "@/types/product";
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

// type ProductCardProps = {
//   title: string;
//   description: string;
//   images: { url: string; public_id: string }[];
//   price: number;
//   finalPrice: number;
//   discount?: number;
//   rating?: number;
//   reviewsNumber?: number;
//   category?: { name: string };
//   subCategory?: { name: string };
// };

interface IProductCardProps {
  productInfo: IProduct;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchWishlist?: () => QueryActionCreatorResult<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    QueryDefinition<string | void, any, any, IProduct[], any>
  >;
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
  refetchWishlist,
}: IProductCardProps) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card
      sx={{
        maxWidth: 300,
        width: "100%",
        borderRadius: 3,
        boxShadow: 4,
      cursor: "pointer",
        transition: "0.3s",
        "&:hover": { boxShadow: 8, transform: "translateY(-4px)" },
      }}
       onClick={() => router.push(`/products/${_id}`)}
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
        }}
      />

      <CardContent>
        {/* Title */}
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
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
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Rating value={rating || 0} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            ({rating || 0})
          </Typography>
        </Stack>

        {/* Actions */}
        <Box mt={2}>
          <Button variant="contained" color="primary" fullWidth>
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
