import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongdbURI = process.env.MongoDB_URI;

export async function connectDB() {
  try {
    await mongoose.connect(mongdbURI);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
}
