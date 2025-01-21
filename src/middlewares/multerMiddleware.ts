import multer from 'multer';

const uploadImg = multer({
  limits: {
    fileSize: 5000000 // Limit file size to 5MB
  },
  fileFilter(_, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a profile image file (jpg, jpeg, or png)'));
    }

    cb(null, true);
  }
});

const multerMiddleware = {
  profileImageUpload: uploadImg,
  imageUpload: uploadImg
};

export default multerMiddleware;
