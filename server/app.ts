import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import projectRouter from "./routes/project.routes";
import collectionRouter from "./routes/collection.routes";
import folderRouter from "./routes/folder.routes";
import endpointRouter from "./routes/endpoint.routes";
import searchRouter from "./routes/search.routes";
import mockRouter from "./routes/mock.routes";
import proxyRouter from "./routes/proxy.routes";
import aiRouter from "./routes/ai.routes";

const app = express();

// Set request timeout to 30 seconds (prevents hanging requests)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

app.use(express.json());
app.use(cors());

app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", message: "ReqForge API is healthy and connected" });
});

app.use(["/api/auth", "/auth"], authRouter);
app.use(["/api/users", "/users"], userRouter);
app.use(["/api/projects", "/projects"], projectRouter);
app.use(["/api/collections", "/collections"], collectionRouter);
app.use(["/api/folders", "/folders"], folderRouter);
app.use(["/api/endpoints", "/endpoints"], endpointRouter);
app.use(["/api/search", "/search"], searchRouter);
app.use(["/api/mock", "/mock"], mockRouter);
app.use(["/api/proxy", "/proxy"], proxyRouter);
app.use(["/api/ai", "/ai"], aiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err?.message || "Internal Server Error",
    error: err instanceof Error ? err.message : String(err),
  });
});

export default app;