// @ts-nocheck
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { seedArticles } from "./article.seed.js";
import { seedDestinations } from "./destination.seed.js";
import { seedInterests } from "./interest.seed.js";

async function seedDatabase() {
  dotenv.config();
  await connectDB();

  try {
    await seedDestinations();
    await seedInterests();
    await seedArticles();
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error("❌ Failed to seed the database:", error);
  process.exitCode = 1;
});
