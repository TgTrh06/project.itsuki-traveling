import mongoose from "mongoose";
import { getEnv } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  await mongoose.connect(getEnv().MONGO_URI);
  logger.info("database_connected", { host: mongoose.connection.host });
};
