import { apiSlice } from "./apiSlice";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    paymentPaybal: builder.mutation({
      query: (token) => ({
        url: `/paypal/capture/${token}`,
        headers: {
          "Cache-Control": "no-store", // Prevent caching
        },
        method: "POST",
      }),
    }),

  }),
});

export const { usePaymentPaybalMutation } = paymentApiSlice;
