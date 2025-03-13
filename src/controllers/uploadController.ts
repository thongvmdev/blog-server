import type { IRequestWithUploadMedia } from '@/interfaces';

import type { NextFunction, Response } from 'express';
import { EHttpStatusCode, ETypeUpload } from '@/enums';
import { ResErrorModel, ResSuccessModel } from '@/models';
import { moveFileToUploadFolder } from '@/utils';

const uploadController = {
  async uploadImage(req: IRequestWithUploadMedia, res: Response, _next: NextFunction) {
    const file = req.file;

    if (!file) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('No file uploaded'));
    }

    const imageUrl = moveFileToUploadFolder(req, file.filename, ETypeUpload.ARTICLES);

    return res.status(EHttpStatusCode.OK).json(ResSuccessModel({ imageUrl }));
  },
};

export default uploadController;
