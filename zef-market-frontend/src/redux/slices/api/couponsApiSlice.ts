import { ICoupon, ICouponsResponse } from "@/types/coupons";
import { apiSlice } from "./apiSlice";

export const couponsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<ICouponsResponse, void>({
      query: () => ({
        url: `/api/v1/coupon`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Category"],
    }),

    getCouponsAdmin: builder.query<ICouponsResponse, string | void>({
      query: (queries = "") => ({
        url: `/api/v1/coupon${queries}&_t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 1,
      providesTags: (result) =>
        result
          ? [
              ...result.coupons.map(({ _id }) => ({
                type: "Coupon" as const,
                _id,
              })),
              { type: "Coupon", id: "LIST" },
            ]
          : [{ type: "Coupon", id: "LIST" }],
    }),

    deleteCouponAdminPage: builder.mutation<
      void,
      { _id: string; page?: number }
    >({
      query: ({ _id }) => ({
        url: `/api/v1/coupon/${_id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ _id, page }, { dispatch, queryFulfilled }) {
        const queryParams = `?page=${page}`;
        const patchResult = dispatch(
          couponsApiSlice.util.updateQueryData(
            "getCouponsAdmin",
            queryParams,
            (draft: ICouponsResponse) => {
              draft.coupons = draft.coupons.filter(
                (coupon) => coupon._id !== _id
              );
              draft.pagination.total -= 1;
              if (draft.coupons.length === 0 && page && page > 1) {
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
      invalidatesTags: (result, error, { _id }) => [{ type: "Coupon", _id }],
    }),

    updateCoupon: builder.mutation({
      query: ({ payLoad, couponId }) => ({
        url: `/api/v1/coupon/${couponId}`,
        headers: {
          "Cache-Control": "no-store", // Prevent caching
        },
        method: "PATCH",
        body: payLoad,
      }),
    }),

    getOneCoupon: builder.query<ICoupon, string | void>({
      query: (id) => ({
        url: `/api/v1/coupon/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Coupon"],
    }),

    createCoupon: builder.mutation({
      query: (data) => ({
        url: `/api/v1/coupon`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponsAdminQuery,
  useDeleteCouponAdminPageMutation,
  useGetOneCouponQuery,
  useUpdateCouponMutation,
  useCreateCouponMutation,
} = couponsApiSlice;
