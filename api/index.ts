
import app from "../server/app";
import mongoose from "mongoose";

let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing in Vercel Environment Variables.");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  isConnected = true;
}

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error: any) {
    console.error("Database connection error in Vercel function:", error);
    return res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error instanceof Error ? error.message : String(error),
      tip: "Ensure MONGODB_URI is configured in Vercel Project Settings -> Environment Variables and MongoDB Atlas IP Whitelist includes 0.0.0.0/0.",
    });
  }
}

