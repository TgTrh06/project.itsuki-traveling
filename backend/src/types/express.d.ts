import type { HydratedDocument } from "mongoose";
import type { UserFields } from "./models.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<UserFields>;
    }
  }
}

export {};
