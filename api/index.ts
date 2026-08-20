import app from "../server/app";
import mongoose from "mongoose";

// Track connection promise to avoid duplicate connect calls on concurrent requests
let connectionPromise: Promise<void> | null = null;

async function connectToDatabase(): Promise<void> {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Connection is in progress — reuse the same promise
  if (connectionPromise) {
    return connectionPromise;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Go to Vercel → Project Settings → Environment Variables and add MONGODB_URI."
    );
  }

  connectionPromise = mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // 15s — enough for Vercel cold starts
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      bufferCommands: false,
    })
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      // Reset so next request retries the connection
      connectionPromise = null;
      throw err;
    });

  // Reset promise reference on disconnect so next request reconnects
  mongoose.connection.once("disconnected", () => {
    connectionPromise = null;
    console.warn("MongoDB disconnected — will reconnect on next request");
  });

  return connectionPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error: any) {
    console.error("Database connection error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error instanceof Error ? error.message : String(error),
      tip: "1) Add MONGODB_URI to Vercel → Project Settings → Environment Variables. 2) In MongoDB Atlas → Network Access, allow 0.0.0.0/0.",
    });
  }
}
