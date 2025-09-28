import {  IGetAdminCounts } from "@/types/general";
import { apiSlice } from "./apiSlice";

export const utilsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCounts: builder.query<IGetAdminCounts, void>({
      query: () => ({
        url: `/get-admin-counts`,
      }),
      keepUnusedDataFor: 5,
    }),

  }),
});

export const {useGetAdminCountsQuery} = utilsApiSlice;
