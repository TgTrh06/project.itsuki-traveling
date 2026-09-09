import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { getEnv } from "./config/env.js";
import { logger } from "./utils/logger.js";

const env = getEnv();
const app = createApp(env);

connectDB()
  .then(() => app.listen(env.PORT, () => logger.info("server_started", { port: env.PORT, environment: env.NODE_ENV })))
  .catch((error) => {
    logger.error("server_start_failed", { errorMessage: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  });
