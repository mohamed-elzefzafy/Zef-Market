import { Pagination } from "./product";

export interface ICouponsResponse {
  coupons: ICoupon[];
  pagination: Pagination;
}

export interface ICoupon {
  _id: string;
  name: string;
  expireDate: string;
  discount: number;
  createdAt: string;
  updatedAt: string;
}
export interface IAddCoupon {
  name: string;
  expireDate: string;
  discount: number;
}
