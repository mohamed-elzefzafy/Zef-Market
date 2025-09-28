import { apiSlice } from "./apiSlice";
import { IBannersResult } from "@/types/banner";

export const bannerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBanner: builder.mutation({
      query: (data) => ({
        url: `/api/v1/banner`,
        method: "POST",
        body: data,
      }),
    }),

    getBanners: builder.query<IBannersResult[], void>({
      query: () => ({
        url: `/api/v1/banner`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Banners"],
    }),

    getOneBanner: builder.query<IBannersResult, string | void>({
      query: (id) => ({
        url: `/api/v1/banner/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Banners"],
    }),

    updateBanner: builder.mutation({
      query: ({ payLoad, bannerId }) => ({
        url: `/api/v1/banner/${bannerId}`,
        headers: {
          "Cache-Control": "no-store",
        },
        method: "PATCH",
        body: payLoad,
      }),
    }),

    getBannersAdmin: builder.query<IBannersResult[], string | void>({
      query: (queries = "") => ({
        url: `/api/v1/banner${queries}&_t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 1,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Banners" as const,
                _id,
              })),
              { type: "Banners", id: "LIST" },
            ]
          : [{ type: "Banners", id: "LIST" }],
    }),

    deleteBanner: builder.mutation<void, { bannerId: string }>({
      query: ({ bannerId }) => ({
        url: `/api/v1/banner/${bannerId}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const {
  useCreateBannerMutation,
  useGetBannersAdminQuery,
  useGetOneBannerQuery,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
} = bannerApiSlice;
