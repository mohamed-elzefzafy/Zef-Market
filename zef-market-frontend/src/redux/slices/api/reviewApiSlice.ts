import { EndpointBuilder } from "@reduxjs/toolkit/query";
import { apiSlice } from "./apiSlice";
import { IReview, IReviewResponse } from "@/types/review";
import { IReviewInput } from "./wislistApiSlice";

export interface IReviewsBody {
  comment: string;
  rating: number;
  product: string;
}

export interface IReviewsUpdateBody {
  comment: string;
  rating: number;
  product: string;
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

    createReview: builder.mutation<IReview, IReviewsBody>({
      query: (data) => ({
        url: `/api/v1/reviews`,
        method: "POST",
        body: data,
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
      query: ({ payLoad, reviewId }) => ({
        url: `/api/v1/reviews/${reviewId}`,
        method: "PATCH",
        body: payLoad,
      }),
      invalidatesTags: ["Review"],
    }),

    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/api/v1/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),

    deleteReviewByAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/v1/reviews/admin-remove/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"],
    }),

        deleteReviewAdminDashboardPage: builder.mutation<
          void,
          { _id: string; page?: number }
        >({
          query: ({ _id }) => ({
            url: `/api/v1/reviews/admin-remove/${_id}`,
            method: "DELETE",
          }),
          async onQueryStarted({ _id, page }, { dispatch, queryFulfilled }) {
            const queryParams = `?page=${page}`;
            const patchResult = dispatch(
              reviewsApiSlice.util.updateQueryData(
                "getAdminReviews",
                queryParams,
                (draft: IReviewResponse) => {
                  draft.reviews = draft.reviews.filter(
                    (review) => review._id !== _id
                  );
                  draft.pagination.total -= 1;
                  if (draft.reviews.length === 0 && page && page > 1) {
                    draft.pagination.page = page - 1;
                  }
                }
              )
            );
            try {
              await queryFulfilled;
            } catch {
              patchResult.undo();
            }
          },
          invalidatesTags: (result, error, { _id }) => [{ type: "Review", _id }],
        }),

    getAdminReviews: builder.query<IReviewResponse, string>({
      query: () => ({
        url: `/api/v1/reviews/admin-find-all-reviews`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Review"],
    }),

    getAllReviewsAdmin: builder.query<IReview[], void>({
      query: () => ({
        url: `/api/v1/reviews`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Review"],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useDeleteReviewByAdminMutation,
  useGetReviewsQuery,
  useGetAllReviewsAdminQuery,
  useGetAdminReviewsQuery,
  useDeleteReviewAdminDashboardPageMutation,
} = reviewsApiSlice;
