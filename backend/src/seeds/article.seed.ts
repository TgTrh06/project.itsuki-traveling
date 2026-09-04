import mongoose from "mongoose";
import dotenv from "dotenv";
import { Article } from "../models/article.model.js";
import { User } from "../models/user.model.js";
import { Destination } from "../models/destination.model.js";
import { Interest } from "../models/interest.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();
await connectDB();

const seedArticles = async () => {
  try {
    await Article.deleteMany();

    const users = await User.find();
    const destinations = await Destination.find();
    const interests = await Interest.find();

    if (!users.length || !destinations.length || !interests.length) {
      throw new Error("Missing users, destinations, or interests in DB");
    }

    const tokyo = destinations.find((d) => d.slug === 'tokyo');

    for (let i = 0; i < 20; i++) {
      const randomUser = users[i % users.length]._id;
      const randomDestination = (i === 0 && tokyo) ? tokyo._id : destinations[i % destinations.length]._id;
      const randomInterests = interests
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((int) => int._id);

      const article = await Article.create({
        title: `Bài viết số ${i + 1}`,
        slug: `bai-viet-so-${i + 1}`,
        summary: `Tóm tắt cho bài viết số ${i + 1}`,
        content: `Nội dung chi tiết của bài viết số ${i + 1}`,
        imageUrl: `https://source.unsplash.com/random/800x600?sig=${i}`,
        location: {
          lat: 35.6895 + (Math.random() - 0.5) * 0.1,
          lng: 139.6917 + (Math.random() - 0.5) * 0.1,
          address: `Tokyo Location ${i + 1}`
        },
        meta: {
          views: Math.floor(Math.random() * 1000),
          likes: [],
        },
        author: randomUser,
        destination: randomDestination,
        interests: randomInterests,
      });

      // Cập nhật lại Destination
      await Destination.findByIdAndUpdate(
        randomDestination,
        { $push: { articles: article._id } }
      );
    }

    console.log("✅ Articles and Destination references seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding articles:", err);
    process.exit(1);
  }
};

seedArticles();