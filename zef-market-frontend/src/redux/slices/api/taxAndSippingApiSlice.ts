import { apiSlice } from "./apiSlice";
import { ICreateTaxAndSipping, ITaxAndSipping } from "@/types/taxAndSipping";

export const taxAndSippingApiSliceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminTaxAndShipping: builder.query<ITaxAndSipping, void>({
      query: () => ({
        url: `/api/v1/tax-and-shipping`,
      }),
      keepUnusedDataFor: 5,
    }),


        updateTaxAndShipping: builder.mutation<ITaxAndSipping, ICreateTaxAndSipping>({
      query: (body) => ({
        url: `/api/v1/tax-and-shipping`,
        headers: {
          "Cache-Control": "no-store",
        },
        method: "PATCH",
        body,
      }),
    }),
    
  }),
});

export const {useGetAdminTaxAndShippingQuery,useUpdateTaxAndShippingMutation} = taxAndSippingApiSliceApiSlice;
