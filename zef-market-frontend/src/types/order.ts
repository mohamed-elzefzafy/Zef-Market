import { CloudinaryObject, IUserInfo } from "./auth";
import { IProduct, Pagination } from "./product";

export interface IOrderItem {
  productId: IProduct;
  quantity: number;
  price: number;
  finalPrice: number;
  productOrderImage: CloudinaryObject;
  productOrderTitle: string;
}

export interface IOrder {
  _id: string;
  user: IUserInfo;
  orderItems: IOrderItem[];
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  totalOrderPriceAfterDiscount: number;
  discount: number;
  tax: number;
  shipping: number;
  paymentMethodType: "cash" | "stripe" | "paypal" | "paymob";
  isPaid: boolean;
  isDelivered: boolean;
  deliveredAt?: Date | string;
  paidAt?: Date | string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  __v: number;
}

export interface IOrderResponse {
  orders: IOrder[];
  pagination: Pagination;
}
