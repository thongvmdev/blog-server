import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.umwqrqc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    );
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
