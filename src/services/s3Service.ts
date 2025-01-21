import AWS from 'aws-sdk';
const s3 = new AWS.S3();

interface File {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

interface S3Response {
  url: string;
  key: string;
}

const uploadToS3 = async (file: File): Promise<S3Response> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();

  return { url: result.Location, key: result.Key };
};

const deleteFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  };

  await s3.deleteObject(params).promise();
};

const connectToS3 = (): void => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  s3.listBuckets((err, data) => {
    if (err) {
      console.log('Error connecting to S3:', err);
    } else {
      console.log('Successfully connected to S3. Buckets:', data.Buckets);
    }
  });
};

const s3Service = {
  connectToS3,
  uploadToS3,
  deleteFromS3
};

export default s3Service;
