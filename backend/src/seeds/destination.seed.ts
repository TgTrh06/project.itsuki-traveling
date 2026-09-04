// @ts-nocheck
import fs from "fs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js"
import { Destination } from "../models/destination.model.js";
import { JSDOM } from "jsdom";
import dotenv from "dotenv";

import slugify from "../utils/slugify.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

async function seedDestinations() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Đọc file SVG
    const svgData = fs.readFileSync("src/assets/japanLow.svg", "utf-8");

    // 3️⃣ Parse SVG để lấy dữ liệu
    const dom = new JSDOM(svgData);
    const document = dom.window.document;

    // lấy tất cả path trong .svg
    const nodes = document.querySelectorAll("path");

    const destinations = [];
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
      console.log("⚠️ Không tìm thấy path nào trong SVG!");
      process.exit(1);
    }

    // 4️⃣ Xóa dữ liệu cũ và thêm mới
    await Destination.deleteMany({});
    await Destination.insertMany(destinations);

    console.log(
      `🎉 Đã thêm ${destinations.length} địa điểm từ SVG vào MongoDB.`
    );
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDestinations();
