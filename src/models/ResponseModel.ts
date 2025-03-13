import type { IApiResponse, IApiResponseWithPaging, IHydratedUserModel, IPaging, IResponseError, IUserModelKeys } from '@/interfaces';

import { pick } from 'lodash';

function ResSuccessModel<T>(data?: T): IApiResponse<T> {
  return {
    success: true,
    data,
  };
}

function ResSuccessModelWithPaging<T>(data: T, paging: IPaging): IApiResponseWithPaging<T> {
  return {
    success: true,
    data,
    paging,
  };
}

function ResErrorModel(message: string, errorCode?: number): IResponseError {
  return {
    success: false,
    message,
    errorCode,
  };
}

function ResUserSuccessModel(userData: IHydratedUserModel, userFields: IUserModelKeys[] = ['email', 'profilePictureUrl']) {
  return {
    id: userData._id,
    ...pick(userData, userFields),
  };
}

export { ResErrorModel, ResSuccessModel, ResSuccessModelWithPaging, ResUserSuccessModel };
