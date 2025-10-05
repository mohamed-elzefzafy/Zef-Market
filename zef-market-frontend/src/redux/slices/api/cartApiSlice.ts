import { apiSlice } from "./apiSlice";
import { ICart } from "@/types/cart";

export interface IAddToCart {
  quantity: number;
  productId: string;
}

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addToCart: builder.mutation<ICart, IAddToCart>({
      query: (data) => ({
        url: `/api/v1/cart/add-to-cart`,
          headers: {
          "Cache-Control": "no-store",
        },
        method: "POST",
        body: data,
      }),
    }),

    getCurrentUserCart: builder.query<ICart, void>({
      query: () => ({
        url: `/api/v1/cart/current-user-cart`,
            headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Cart"],
    }),

    deleteItemFromCart: builder.mutation<ICart, { productId: string }>({
      query: (data) => ({
        url: `/api/v1/cart/remove-productFrom-cart`,
        method: "PATCH",
        body: data,
      }),
    }),

    // cartApiSlice.ts
    applyCouponToCart: builder.mutation<ICart, { couponName: string }>({
      query: (body) => ({
        url: `/api/v1/cart/upply-coupon-to-cart`, // أو نفس اسم الروت عندك
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    changeQuantityForProductCart: builder.mutation<ICart, IAddToCart>({
      query: (data) => ({
        url: `/api/v1/cart/change-productQuantity-cart`,
        method: "PATCH",
        body: data,
      }),
    }),

    increaseCartproductQuantity: builder.mutation<ICart, { productId: string }>(
      {
        query: (data) => ({
          url: `/api/v1/cart/increase-product-quantity-cart`,
          method: "PATCH",
          body: data,
        }),
      }
    ),

    decreaseCartproductQuantity: builder.mutation<ICart, { productId: string }>(
      {
        query: (data) => ({
          url: `/api/v1/cart/decrease-product-quantity-cart`,
          method: "PATCH",
          body: data,
        }),
      }
    ),

    // updateCategory: builder.mutation({
    //   query: ({ payLoad, categoryId }) => ({
    //     url: `/api/v1/category/${categoryId}`,
    //     headers: {
    //       "Cache-Control": "no-store", // Prevent caching
    //     },
    //     method: "PATCH",
    //     body: payLoad,
    //   }),
    // }),

    // getOneCategory: builder.query<ICategory, string | void>({
    //   query: (id) => ({
    //     url: `/api/v1/category/${id}`,
    //   }),
    //   keepUnusedDataFor: 5,
    //   providesTags: ["Category"],
    // }),

    // createCategory: builder.mutation({
    //   query: (data) => ({
    //     url: `/api/v1/category`,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),

    // getCategoriesAdmin: builder.query<ICategoryResponse, string | void>({
    //   query: (queries = "") => ({
    //     url: `/api/v1/category${queries}&_t=${Date.now()}`,
    //     headers: {
    //       "Cache-Control": "no-store",
    //     },
    //   }),
    //   keepUnusedDataFor: 1,
    //   providesTags: (result) =>
    //     result
    //       ? [
    //           ...result.categories.map(({ _id }) => ({
    //             type: "Category" as const,
    //             _id,
    //           })),
    //           { type: "Category", id: "LIST" },
    //         ]
    //       : [{ type: "Category", id: "LIST" }],
    // }),

    // deleteCategoryAdminPage: builder.mutation<
    //   void,
    //   { _id: string; page?: number }
    // >({
    //   query: ({ _id }) => ({
    //     url: `/api/v1/category/${_id}`,
    //     method: "DELETE",
    //   }),
    //   async onQueryStarted({ _id, page }, { dispatch, queryFulfilled }) {
    //     const queryParams = `?page=${page}`;
    //     const patchResult = dispatch(
    //       categoryApiSlice.util.updateQueryData(
    //         "getCategoriesAdmin",
    //         queryParams,
    //         (draft: ICategoryResponse) => {
    //           draft.categories = draft.categories.filter(
    //             (category) => category._id !== _id
    //           );
    //           draft.pagination.total -= 1;
    //           if (draft.categories.length === 0 && page && page > 1) {
    //             draft.pagination.page = page - 1;
    //           }
    //         }
    //       )
    //     );
    //     try {
    //       await queryFulfilled;
    //     } catch {
    //       patchResult.undo();
    //     }
    //   },
    //   invalidatesTags: (result, error, { _id }) => [{ type: "Category", _id }],
    // }),
  }),
});

export const {
  useGetCurrentUserCartQuery,
  useApplyCouponToCartMutation,
  useAddToCartMutation,
  useDeleteItemFromCartMutation,
  useChangeQuantityForProductCartMutation,
  useIncreaseCartproductQuantityMutation,
  useDecreaseCartproductQuantityMutation,
} = cartApiSlice;
