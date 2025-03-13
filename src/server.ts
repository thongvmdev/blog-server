/* eslint-disable import/first */
import type { NextFunction, Request, Response } from 'express';
import { envConfig } from './config/env.config';

if (envConfig.NODE_ENV !== 'development') {
  // eslint-disable-next-line ts/no-require-imports
  require('module-alias/register');
}

import path from 'node:path';
import corsOptions from '@/config/corsOptions';
import connectDB from '@/config/dbConnect';
import { EHttpStatusCode } from '@/enums';
import { errorHandlerMiddleware, morganMiddleware } from '@/middlewares';
import v1Routes from '@/routes/v1Routes';
import bodyParser from 'body-parser';

import compression from 'compression';
import cookieParser from 'cookie-parser';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { ResErrorModel } from './models';

// eslint-disable-next-line ts/no-require-imports
require('express-async-errors');

void connectDB();

const app = express();
app.use(cors(corsOptions));

app.use(morganMiddleware);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

if (envConfig.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

app.use('/api/v1', v1Routes);

app.all('*', (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('API Endpoint Not Found'));
});

app.use(errorHandlerMiddleware);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(envConfig.PORT, () => {
    console.log(`Server running on port ${envConfig.PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});
