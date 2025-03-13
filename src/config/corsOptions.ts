import type { CorsOptions } from 'cors';

const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'https://hanu-nus.com'];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    }
    else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
