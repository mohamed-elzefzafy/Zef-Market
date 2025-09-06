import { IProduct } from "./product";

export interface ICartItem {
  productId: IProduct;
  quantity: number;
  price: number;
  finalPrice: number;
}

export interface ICart {
  _id: string;
  cartItems: ICartItem[];
  totalPrice: number;
  totalPriceAfterDiscount: number;
  coupons: string[];  
  user: string;  
  createdAt: string; 
  updatedAt: string;  
  __v: number;
}
