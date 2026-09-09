import mongoose from "mongoose";
import type { DestinationFields } from "../types/models.js";

const destinationSchema = new mongoose.Schema<DestinationFields>(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    svgId: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String
    },
    imageUrl: {
      type: String,
    },
    region: {
      type: String,
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true
      }
    ]
  },
  { timestamps: true }
);

export const Destination = mongoose.model<DestinationFields>("Destination", destinationSchema);
