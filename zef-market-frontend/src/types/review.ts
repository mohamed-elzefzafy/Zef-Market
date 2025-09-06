import { IUserInfo } from "./auth";
import {  IProduct, Pagination } from "./product";

export interface IReview {
  _id: string;
  comment: string;
  rating: number;
  user: IUserInfo;
  product: IProduct;
  createdAt: string;
  updatedAt: string;
}


export interface IReviewResponse {
  reviews: IReview[];
  pagination: Pagination;
}
