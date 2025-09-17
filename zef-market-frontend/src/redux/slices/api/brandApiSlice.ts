import { apiSlice } from "./apiSlice";
import { IBrand, IBrandResponse } from "@/types/brand";

export const brandApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<IBrandResponse, void>({
      query: () => ({
        url: `/api/v1/brand`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Brand"],
    }),

    updateBrand: builder.mutation({
      query: ({ payLoad, brandId }) => ({
        url: `/api/v1/brand/${brandId}`,
        headers: {
          "Cache-Control": "no-store",
        },
        method: "PATCH",
        body: payLoad,
      }),
    }),

    getOneBrand: builder.query<IBrand, string | void>({
      query: (id) => ({
        url: `/api/v1/brand/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Brand"],
    }),

    createBrand: builder.mutation({
      query: (data) => ({
        url: `/api/v1/brand`,
        method: "POST",
        body: data,
      }),
    }),

    getBrandsAdmin: builder.query<IBrandResponse, string | void>({
      query: (queries = "") => ({
        url: `/api/v1/brand${queries}&_t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 1,
      providesTags: (result) =>
        result
          ? [
              ...result.brands.map(({ _id }) => ({
                type: "Brand" as const,
                _id,
              })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
    }),

    deleteBrandAdminPage: builder.mutation<
      void,
      { _id: string; page?: number }
    >({
      query: ({ _id }) => ({
        url: `/api/v1/brand/${_id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ _id, page }, { dispatch, queryFulfilled }) {
        const queryParams = `?page=${page}`;
        const patchResult = dispatch(
          brandApiSlice.util.updateQueryData(
            "getBrandsAdmin",
            queryParams,
            (draft: IBrandResponse) => {
              draft.brands = draft.brands.filter((brand) => brand._id !== _id);
              draft.pagination.total -= 1;
              if (draft.brands.length === 0 && page && page > 1) {
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
      invalidatesTags: (result, error, { _id }) => [{ type: "Brand", _id }],
    }),

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
  useGetBrandsQuery,
  useUpdateBrandMutation,
  useGetOneBrandQuery,
  useCreateBrandMutation,
  useGetBrandsAdminQuery,
  useDeleteBrandAdminPageMutation,
} = brandApiSlice;
