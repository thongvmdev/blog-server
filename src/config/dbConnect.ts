import mongoose from 'mongoose';

import { envConfig } from './env.config';

async function connectDB(): Promise<void> {
  try {
    const mongoURI = envConfig.MONGO_URL;
    await mongoose.connect(mongoURI);
  }
  catch (err) {
    console.log(err);
  }
}

export default connectDB;
