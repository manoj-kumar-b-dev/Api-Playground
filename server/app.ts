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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ReqForge API is healthy and connected" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/folders", folderRouter);
app.use("/api/endpoints", endpointRouter);
app.use("/api/search", searchRouter);
app.use("/api/mock", mockRouter);
app.use("/api/proxy", proxyRouter);
app.use("/api/ai", aiRouter);

export default app;