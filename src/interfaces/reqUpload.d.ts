import type { Request } from 'express';
import type { Multer } from 'multer';

export interface IRequestWithUploadMedia extends Request {
  user: IJwtUserPayload;
  file: Multer.File;
}
