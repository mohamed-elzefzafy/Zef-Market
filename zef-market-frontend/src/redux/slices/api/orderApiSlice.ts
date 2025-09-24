import { IOrder, IOrderResponse } from "@/types/order";
import { apiSlice } from "./apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrderById: builder.query<IOrder, string | void>({
      query: (orderId) => ({
        url: `/api/v1/order/${orderId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"],
    }),

    createOrder: builder.mutation({
      query: (payLoad) => ({
        url: `/api/v1/order/create-order`,
        headers: {
          "Cache-Control": "no-store",
        },
        method: "POST",
        body: payLoad,
      }),
    }),

    toggleOrderToDeliverdStatue: builder.mutation<IOrder, string | void>({
      query: (id) => ({
        url: `/api/v1/order/admin-update-order-to-deliver/${id}`,
        method: "PATCH",
      }),
    }),
    toggleOrderToPaidStatue: builder.mutation<IOrder, string | void>({
      query: (id) => ({
        url: `/api/v1/order/admin-update-order-to-paid/${id}`,
        method: "PATCH",
      }),
    }),


    // getOneOrder: builder.query<IOrder, string | void>({
    //   query: (id) => ({
    //     url: `/api/v1/order/${id}`,
    //   }),
    //   keepUnusedDataFor: 5,
    //   providesTags: ["Order"],
    // }),

    getOrdersAdmin: builder.query<IOrderResponse, string | void>({
      query: (queries = "") => ({
        url: `/api/v1/order/get-admin-all-orders${queries}&_t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 1,
      providesTags: (result) =>
        result
          ? [
              ...result.orders.map(({ _id }) => ({
                type: "Order" as const,
                _id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

        getOrdersCurrentUser: builder.query<IOrderResponse, string | void>({
      query: (queries = "") => ({
        url: `/api/v1/order/get-current-user-all-orders${queries}&_t=${Date.now()}`,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      keepUnusedDataFor: 1,
      providesTags: (result) =>
        result
          ? [
              ...result.orders.map(({ _id }) => ({
                type: "Order" as const,
                _id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),


  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useToggleOrderToDeliverdStatueMutation,
  useToggleOrderToPaidStatueMutation,
  useGetOrdersAdminQuery,
  useGetOrdersCurrentUserQuery,
} = orderApiSlice;
