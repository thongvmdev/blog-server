import { type NextFunction, type Response } from 'express';

import { EHttpStatusCode } from '@/enums';
import { type IRequestWithUploadMedia } from '@/interfaces';
import { ResErrorModel, ResSuccessModel } from '@/models';
import { s3Service } from '@/services';

const uploadController = {
  async uploadImage(req: IRequestWithUploadMedia, res: Response, next: NextFunction) {
    const file = req.file;

    try {
      if (!file) {
        return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('No file uploaded'));
      }

      const s3Data = await s3Service.uploadToS3(file);

      return res.status(EHttpStatusCode.OK).json(ResSuccessModel({ imageUrl: s3Data.url }));
    } catch (error) {
      next(error);
    }
  }
};

export default uploadController;
