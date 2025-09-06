import { IUserInfo } from "./auth";
import { Pagination } from "./product";

export interface ICurrentUserInstructorRequest {
  _id: string;
  requestStatueTitle: string;
  createdAt: string;
  updatedAt: string;
  user: IUserInfo;
}

export interface IInstructorRequestResponse {
  instructorRequest: ICurrentUserInstructorRequest[];
  pagination: Pagination;
}
