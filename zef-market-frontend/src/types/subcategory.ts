import { CloudinaryObject } from "./auth";
import { ICategory } from "./coupons";
import { Pagination } from "./product";

export interface ISubCategoryResponse {
  subCategories: ISubCategory[];
  pagination: Pagination;
}

export interface ISubCategory {
  _id: string;
  title: string;
  category: ICategory;
  image: CloudinaryObject;
  createdAt: string;
  updatedAt: string;
}
export interface IAddSubCategory {
  title: string;
  image: CloudinaryObject;
}

export interface IAddSubCategory {
  title: string;
  category: string;
  image: CloudinaryObject;
}
