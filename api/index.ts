import app from "../server/app";
import mongoose from "mongoose";

// Track connection promise to avoid duplicate connect calls on concurrent requests
let connectionPromise: Promise<typeof mongoose> | null = null;

async function connectToDatabase(): Promise<void> {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Connection is in progress — reuse the same promise
  if (connectionPromise) {
    await connectionPromise;
    if (mongoose.connection.readyState === 1) {
      return;
    }
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI || !MONGODB_URI.trim()) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Add MONGODB_URI under Vercel Project Settings → Environment Variables."
    );
  }

  connectionPromise = mongoose.connect(MONGODB_URI.trim(), {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
  });

  try {
    await connectionPromise;
    console.log("MongoDB connected successfully");
  } catch (err) {
    connectionPromise = null;
    console.error("MongoDB connection error:", err);
    throw err;
  }

  mongoose.connection.once("disconnected", () => {
    connectionPromise = null;
    console.warn("MongoDB disconnected — will reconnect on next request");
  });
}

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error instanceof Error ? error.message : String(error),
      tip: "1) Check MONGODB_URI in Vercel → Project Settings → Environment Variables. 2) In MongoDB Atlas → Network Access, allow 0.0.0.0/0.",
    });
  }
}

