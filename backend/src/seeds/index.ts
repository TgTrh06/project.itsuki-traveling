import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { seedArticles } from "./article.seed.js";
import { seedDestinations } from "./destination.seed.js";
import { seedInterests } from "./interest.seed.js";
import { Article } from "../models/article.model.js";
import { Destination } from "../models/destination.model.js";
import { Interest } from "../models/interest.model.js";
import { User } from "../models/user.model.js";
import { assertSafeSeedEnvironment } from "./seed-guard.js";

async function seedDatabase() {
  dotenv.config();
  assertSafeSeedEnvironment();
  await connectDB();

  try {
    const [articles, destinations, interests, users] = await Promise.all([
      Article.countDocuments(),
      Destination.countDocuments(),
      Interest.countDocuments(),
      User.countDocuments(),
    ]);
    console.warn(
      `Seed summary: ${destinations} destinations, ${interests} interests, and ${articles} articles will be replaced. ${users} users will be preserved.`,
    );
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
