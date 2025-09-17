import { ISubCategory, ISubCategoryResponse } from "@/types/subcategory";
import { apiSlice } from "./apiSlice";

export const subcategoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getsubcategories: builder.query<ISubCategoryResponse, string | void>({
      query: (queries) => ({
        url: `/api/v1/subcategory${queries}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Subcategory"],
    }),

    updateSubCategory: builder.mutation({
      query: ({ payLoad, subcategoryId }) => ({
        url: `/api/v1/subcategory/${subcategoryId}`,
        headers: {
          "Cache-Control": "no-store", // Prevent caching
        },
        method: "PATCH",
        body: payLoad,
      }),
    }),

    getOneSubCategory: builder.query<ISubCategory, string | void>({
      query: (id) => ({
        url: `/api/v1/subcategory/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Subcategory"],
    }),

    createSubCategory: builder.mutation({
      query: (data) => ({
        url: `/api/v1/subcategory`,
        method: "POST",
        body: data,
      }),
    }),

    getSubCategoriesAdmin: builder.query<ISubCategoryResponse, string | void>({
      query: (queries = "") => ({
        url: `/api/v1/subcategory${queries}&_t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 1,
      providesTags: (result) =>
        result
          ? [
              ...result.subCategories.map(({ _id }) => ({
                type: "Subcategory" as const,
                _id,
              })),
              { type: "Subcategory", id: "LIST" },
            ]
          : [{ type: "Subcategory", id: "LIST" }],
    }),

    deleteSubCategoryAdminPage: builder.mutation<
      void,
      { _id: string; page?: number }
    >({
      query: ({ _id }) => ({
        url: `/api/v1/subcategory/${_id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ _id, page }, { dispatch, queryFulfilled }) {
        const queryParams = `?page=${page}`;
        const patchResult = dispatch(
          subcategoryApiSlice.util.updateQueryData(
            "getsubcategories",
            queryParams,
            (draft: ISubCategoryResponse) => {
              draft.subCategories = draft.subCategories.filter(
                (subCategory) => subCategory._id !== _id
              );
              draft.pagination.total -= 1;
              if (draft.subCategories.length === 0 && page && page > 1) {
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
      invalidatesTags: (result, error, { _id }) => [{ type: "Subcategory", _id }],
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
  useGetsubcategoriesQuery,
  useUpdateSubCategoryMutation,
  useGetOneSubCategoryQuery,
  useDeleteSubCategoryAdminPageMutation,
  useGetSubCategoriesAdminQuery,
  useCreateSubCategoryMutation,
} = subcategoryApiSlice;
