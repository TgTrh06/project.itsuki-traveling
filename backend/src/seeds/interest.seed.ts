// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Interest } from "../models/interest.model.js";
import { connectDB } from "../config/db.js";
import slugify from "../utils/slugify.js";

const interests = [
  "accommodation",
  "activities",
  "beauty & spa",
  "culture",
  "food",
  "nightlife",
  "shopping",
  "transportation",
];

export async function seedInterests() {
  await Interest.deleteMany({});
  const interestDocs = interests.map((title) => ({
    title,
    slug: slugify(title),
  }));
  await Interest.insertMany(interestDocs);
  console.log("✅ Interests seeded successfully");
};

async function runStandaloneSeed() {
  dotenv.config();
  await connectDB();
  try {
    await seedInterests();
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1]?.endsWith("interest.seed.ts")) {
  runStandaloneSeed().catch((error) => {
    console.error("❌ Failed to seed interests:", error);
    process.exitCode = 1;
  });
}
