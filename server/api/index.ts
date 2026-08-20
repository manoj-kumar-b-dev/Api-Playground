import app from "../app";
import mongoose from "mongoose";

declare global {
  var _mongooseConnectionPromise: Promise<typeof mongoose> | null;
}

if (typeof globalThis._mongooseConnectionPromise === "undefined") {
  globalThis._mongooseConnectionPromise = null;
}

async function connectToDatabase(): Promise<void> {
  if ((mongoose.connection.readyState as number) === 1) {
    return;
  }

  if (globalThis._mongooseConnectionPromise) {
    try {
      await globalThis._mongooseConnectionPromise;
      if ((mongoose.connection.readyState as number) === 1) {
        return;
      }
    } catch {
      globalThis._mongooseConnectionPromise = null;
    }
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI || !MONGODB_URI.trim()) {
    throw new Error(
      "MONGODB_URI environment variable is missing in Vercel. Please add MONGODB_URI under Project Settings → Environment Variables."
    );
  }

  globalThis._mongooseConnectionPromise = mongoose.connect(MONGODB_URI.trim(), {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });

  try {
    await globalThis._mongooseConnectionPromise;
    console.log("MongoDB connected successfully");
  } catch (err) {
    globalThis._mongooseConnectionPromise = null;
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();

    if ((mongoose.connection.readyState as number) !== 1) {
      throw new Error("MongoDB connection is not active (readyState is not 1).");
    }

    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error instanceof Error ? error.message : String(error),
      tip: "1) Ensure MONGODB_URI is configured in Vercel (Project Settings → Environment Variables). 2) In MongoDB Atlas → Network Access, add IP '0.0.0.0/0' to allow Vercel serverless function connections.",
    });
  }
}


