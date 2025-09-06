import { CloudinaryObject } from "./auth";
import { Pagination } from "./product";

export interface IBrandResponse {
  brands: IBrand[];
  pagination: Pagination;
}

export interface IBrand {
  _id: string;
  title: string;
  image: CloudinaryObject;
  createdAt: string;
  updatedAt: string;
}
export interface IAddBrand {
  title: string;
  image: CloudinaryObject;
}
