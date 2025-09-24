import { CloudinaryObject } from "./auth";

export interface IBannersResult {
  _id: string,
  text : string,
  discount : number,
  image : CloudinaryObject,
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ICreateBanner {
  text : string,
  discount : number,
  image : File,

}