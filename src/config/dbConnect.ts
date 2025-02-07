import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URL;
    console.log('🚀 ~ connectDB ~ mongoURI:', mongoURI);
    await mongoose.connect(mongoURI);
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
