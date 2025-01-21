import { type IPaging } from './paging';

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
}

export interface IApiResponseWithPaging<T> {
  success: boolean;
  data?: T;
  paging: IPaging;
}

export interface IResponseError {
  success: boolean;
  message: string;
  errorCode: number;
}
