import { EndpointBuilder } from "@reduxjs/toolkit/query";
import { apiSlice } from "./apiSlice";
import { IReview } from "@/types/review";

export interface IReviewsBody {

    comment : string,
    rating : number,
    product : string,
    reviewId? : string,

}
export const reviewsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
          getReviews: builder.query<IReview[], string>({
            query: (id) => ({
              url: `/api/v1/reviews/find-all/${id}`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ["Reviews"],
          }),
      

    createReview : builder.mutation<IReview, IReviewsBody>({
      query : (data) => ({
        url : `/api/v1/reviews`,
        method : "POST",
        body : data,
      }),
    }),
    // updateReview : builder.mutation<IProduct, IReiews>({
    //   query : (data) => ({
    //     url : `/api/v1/reviews/update-review/${data.productId}?reviewId=${data.reviewId}`,
    //     method : "PUT",
    //     body : data,
    //   }), 
    //   invalidatesTags : ["Reviews"]
    // }),

        updateReview: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/reviews/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Reviews"]
    }),


    deleteReview : builder.mutation({
      query : (id) => ({
        url : `/api/v1/reviews/${id}`,
        method : "DELETE",
      }),
      invalidatesTags : ["Reviews"]
    }),
    deleteReviewByAdmin : builder.mutation({
      query : (id) => ({
        url : `/api/v1/reviews/admin-remove/${id}`,
        method : "PUT",
      }),
      invalidatesTags : ["Reviews"]
    }),
  })
})



export const {useCreateReviewMutation , useUpdateReviewMutation ,useDeleteReviewMutation,useDeleteReviewByAdminMutation ,useGetReviewsQuery} = reviewsApiSlice;