import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI not set. Application will not persist data correctly.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
    return true;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    return false;
  }
};
