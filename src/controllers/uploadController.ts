import { type NextFunction, type Response } from 'express';

import { EHttpStatusCode, ETypeUpload } from '@/enums';
import { type IRequestWithUploadMedia } from '@/interfaces';
import { ResErrorModel, ResSuccessModel } from '@/models';
import { moveFileToUploadFolder } from '@/utils';

const uploadController = {
  async uploadImage(req: IRequestWithUploadMedia, res: Response, next: NextFunction) {
    const file = req.file;
    const { type, articleId } = req.body;

    if (!type || !articleId) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Type and ArticleId are required'));
    }

    if (type !== ETypeUpload.ARTICLES) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Type is invalid'));
    }

    if (!file) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('No file uploaded'));
    }

    const imageUrl = moveFileToUploadFolder(file.filename, type, articleId);

    return res.status(EHttpStatusCode.OK).json(ResSuccessModel({ imageUrl }));
  }
};

export default uploadController;
