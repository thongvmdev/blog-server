/* eslint-disable import/first */
require('express-async-errors');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

if (process.env.NODE_ENV !== 'development') {
  require('module-alias/register');
}

import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';

import { ResErrorModel } from './models';

import corsOptions from '@/config/corsOptions';
import connectDB from '@/config/dbConnect';
import { EHttpStatusCode } from '@/enums';
import { errorHandlerMiddleware, morganMiddleware } from '@/middlewares';
import v1Routes from '@/routes/v1Routes';

const PORT = process.env.PORT || 4000;

void connectDB();

const app = express();
app.use(cors(corsOptions));

app.use(morganMiddleware);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

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
