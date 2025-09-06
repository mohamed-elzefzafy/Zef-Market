import { IUserInfo } from "./auth";
import { Pagination } from "./product";

export interface IUserResponse {
  users: IUserInfo[];
  pagination: Pagination;
}
