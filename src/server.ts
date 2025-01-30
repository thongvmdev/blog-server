/* eslint-disable import/first */
require('express-async-errors');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register');
}

import path from 'path';

import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

import { ResErrorModel } from './models';

import corsOptions from '@/config/corsOptions';
import connectDB from '@/config/dbConnect';
// import { envConfig } from '@/config/env.config';
import { EHttpStatusCode } from '@/enums';
import { errorHandlerMiddleware } from '@/middlewares';
import v1Routes from '@/routes/v1Routes';
import { s3Service } from '@/services';

const PORT = process.env.PORT || 4000;

void connectDB();
s3Service.connectToS3();

const app = express();
app.use(cors(corsOptions));

// if (envConfig.NODE_ENV === 'development') {
app.use(morgan('dev'));
// }

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/api/v1', v1Routes);

app.all('*', (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('API Endpoint Not Found'));
});

app.use(errorHandlerMiddleware);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});
