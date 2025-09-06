import { CloudinaryObject } from "./auth";
import { Pagination } from "./product";

export interface ISubCategoryResponse {
  subCategories: ISubCategory[];
  pagination: Pagination;
}

export interface ISubCategory {
  _id: string;
  title: string;
  image: CloudinaryObject;
  createdAt: string;
  updatedAt: string;
}
export interface IAddSubCategory {
  title: string;
  image: CloudinaryObject;
}
