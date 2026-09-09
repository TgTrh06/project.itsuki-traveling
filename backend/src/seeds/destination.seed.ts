import fs from "fs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js"
import { Destination } from "../models/destination.model.js";
import { JSDOM } from "jsdom";
import dotenv from "dotenv";

import slugify from "../utils/slugify.js";
import { assertSafeSeedEnvironment } from "./seed-guard.js";

type DestinationSeed = { title: string; slug: string; svgId: string };

export async function seedDestinations() {
  // 2️⃣ Đọc file SVG
  const svgData = fs.readFileSync("src/assets/japanLow.svg", "utf-8");

    // 3️⃣ Parse SVG để lấy dữ liệu
    const dom = new JSDOM(svgData);
    const document = dom.window.document;

    // lấy tất cả path trong .svg
    const nodes = document.querySelectorAll("path");

    const destinations: DestinationSeed[] = [];
    nodes.forEach((node) => {
      const id = node.getAttribute("id");
      if (!id) return;

      const title = node.getAttribute("title") || id;
      const slug = slugify(title);

      destinations.push({
        title,
        slug,
        svgId: id,
      });
    });

  if (destinations.length === 0) {
    throw new Error("No destination paths were found in the Japan SVG");
  }

    // 4️⃣ Xóa dữ liệu cũ và thêm mới
  await Destination.deleteMany({});
  await Destination.insertMany(destinations);

  console.log(`🎉 Added ${destinations.length} destinations from the Japan SVG.`);
}

async function runStandaloneSeed() {
  dotenv.config();
  assertSafeSeedEnvironment();
  await connectDB();
  try {
    await seedDestinations();
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1]?.endsWith("destination.seed.ts")) {
  runStandaloneSeed().catch((error) => {
    console.error("❌ Failed to seed destinations:", error);
    process.exitCode = 1;
  });
}
