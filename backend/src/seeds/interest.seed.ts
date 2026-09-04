import mongoose from "mongoose";
import dotenv from "dotenv";
import { Interest } from "../models/interest.model.js";
import { connectDB } from "../config/db.js";
import slugify from "../utils/slugify.js";

dotenv.config();
await connectDB();

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

const seedInterests = async () => {
  try {
    await Interest.deleteMany();
    const interestDocs = interests.map((title) => ({
      title,
      slug: slugify(title),
    }));
    await Interest.insertMany(interestDocs);
    console.log("✅ Interests seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding interests:", err);
    process.exit(1);
  }
};

seedInterests();