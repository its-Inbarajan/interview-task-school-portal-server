import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URL!, {
      dbName: process.env.MONGODB_NAME!,
      maxPoolSize: 20, // optional tuning
    });
    console.log("Connected to MongoDB with Mongoose");
  }
  return mongoose.connection;
}
