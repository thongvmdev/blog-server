import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URL;
    await mongoose.connect(mongoURI);
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
