import { IProduct } from "./product";

export interface IOrderItem {
  productId: IProduct;
  quantity: number;
  price: number;
  finalPrice: number;
}

export interface IOrder {
  _id: string;
  user: string;
  orderItems: IOrderItem[];
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  totalOrderPriceAfterDiscount: number;
  discount: number;
  tax: number;
  shipping: number;
  paymentMethodType: "cash" | "card"; // ممكن تزود قيم تانية لو عندك
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  __v: number;
}
