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

    //     getAdminReviews: builder.query<IReviewResponse, string>({
    //   query: () => ({
    //     url: `/api/v1/reviews/admin-find-all-reviews`,
    //   }),
    //   keepUnusedDataFor: 5,
    //   providesTags: ["Review"],
    // }),

    // getAllReviewsAdmin: builder.query<IReview[], void>({
    //   query: () => ({
    //     url: `/api/v1/reviews`,
    //   }),
    //   keepUnusedDataFor: 5,
    //   providesTags: ["Review"],
    // }),

    // createReview: builder.mutation<IReview, IReviewInput>({
    //   query: (data) => ({
    //     url: `/api/v1/reviews`,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),

    // updateReview: builder.mutation({
    //   query: ({ payLoad, reviewId }) => ({
    //     url: `/api/v1/reviews/${reviewId}`,
    //     method: "PATCH",
    //     body: payLoad,
    //   }),
    //   invalidatesTags: ["Review"],
    // }),

    // deleteReview: builder.mutation({
    //   query: (reviewId) => ({
    //     url: `/api/v1/reviews/${reviewId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Review"],
    // }),

    // deleteReviewByAdmin: builder.mutation({
    //   query: (reviewId) => ({
    //     url: `/api/v1/reviews/admin-instructor-remove/${reviewId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Review"],
    // }),
  }),
});

export const {
  useGetMyWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} = wishlistApiSlice;
