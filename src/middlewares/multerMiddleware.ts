import path from 'node:path';

import { ensureDir } from '@/utils';

import multer from 'multer';

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const folderPath = path.join(__dirname, '../../uploads');

    ensureDir(folderPath);
    cb(null, folderPath);
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${timestamp}-${originalName}`);
  },
});

const uploadImg = multer({
  storage,
  limits: {
    fileSize: 5000000, // Limit file size to 5MB
  },
  fileFilter(_, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Please upload a profile image file (jpg, jpeg, or png)'));
    }

    cb(null, true);
  },
});

const multerMiddleware = {
  uploadImg,
};

export default multerMiddleware;
