import { CloudinaryObject } from "./auth";
import { IBrand } from "./brand";
import { ICategory } from "./category";
import { ISubCategory } from "./subcategory";

export interface IProduct {
  _id: string;
  title: string;
  images: CloudinaryObject[];
  category: ICategory,
  subCategory :ISubCategory,
  brand :IBrand,
  description: string;
  rating: number;
  reviewsNumber: number;
  price: number;
  discount: number;
  finalPrice : number;
  stock: number;
  sold: number;
  // reviews: IReviewsResult[];
  createdAt: string;
  updatedAt: string;
}

export interface IProductInput {
  title: string;
  // images: CloudinaryObject[];
  category: string,
  subCategory :string,
  brand :string,
  description: string;
  price: number;
  discount: number;
  stock: number;
}






export interface IProductResponse {
  products: IProduct[];
  pagination: Pagination;
}
export interface IWishlistResponse {
  wishlist: IProduct[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pagesCount: number;
}
