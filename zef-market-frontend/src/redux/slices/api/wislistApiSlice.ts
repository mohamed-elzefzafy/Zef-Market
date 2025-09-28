import { IWishlistResponse } from "@/types/product";
import { apiSlice } from "./apiSlice";

export interface IReviewInput {
  comment: string;
  rating: number;
  course: string;
}

export interface IReviewInputUpdate {
  comment: string;
  rating: number;
}

export const wishlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyWishlist: builder.query<IWishlistResponse, void>({
      query: () => ({
        url: `/api/v1/wish-list/get-my-wishlist`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Product"],
    }),

    addProductToWishlist: builder.mutation({
      query: (payLoad) => ({
        url: `/api/v1/wish-list`,
        method: "POST",
        body: payLoad,
      }),
    }),

    removeProductFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/api/v1/wish-list/${productId}`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetMyWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} = wishlistApiSlice;
