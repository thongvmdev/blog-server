import { pick } from 'lodash';

import {
  type IResponseError,
  type IApiResponse,
  type IPaging,
  type IApiResponseWithPaging,
  type IHydratedUserModel,
  type IUserModelKeys
} from '@/interfaces';

const ResSuccessModel = <T>(data?: T): IApiResponse<T> => ({
  success: true,
  data
});

const ResSuccessModelWithPaging = <T>(data: T, paging: IPaging): IApiResponseWithPaging<T> => {
  return {
    success: true,
    data,
    paging
  };
};

const ResErrorModel = (message: string, errorCode?: number): IResponseError => ({
  success: false,
  message,
  errorCode
});

const ResUserSuccessModel = (
  userData: IHydratedUserModel,
  userFields: IUserModelKeys[] = ['email', 'profilePictureUrl']
) => {
  return {
    id: userData._id,
    ...pick(userData, userFields)
  };
};

export { ResSuccessModel, ResErrorModel, ResUserSuccessModel, ResSuccessModelWithPaging };
