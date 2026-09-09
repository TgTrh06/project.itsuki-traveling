import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { getEnv, isProduction } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import destinationRouter from "./routes/destination.route.js";
import articleRouter from "./routes/article.route.js";
import commentRouter from "./routes/comment.route.js";
import interestRouter from "./routes/interest.route.js";
import adminRouter from "./routes/admin.routes.js";
import planRouter from "./routes/plan.route.js";

type Env = ReturnType<typeof getEnv>;

export const createApp = (env: Env = getEnv()) => {
  const app = express();
  if (isProduction()) app.set("trust proxy", 1);
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.CLIENT_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }));

  app.get("/", (_req, res) => res.send("Itsuki no Tabi API Running 🗾"));
  app.use("/api/auth", authRouter);
  app.use("/api/destinations", destinationRouter);
  app.use("/api/articles", articleRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/interests", interestRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/plans", planRouter);
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(notFound);
  app.use(errorHandler);
  return app;
};
