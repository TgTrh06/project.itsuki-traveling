import mongoose from 'mongoose';
import type { PlanFields, PlanItemFields } from "../types/models.js";

const PlanItemSchema = new mongoose.Schema<PlanItemFields>(
  {
    _id: { type: String, required: true }, // keep article/destination id as string
    title: String,
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    meta: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const PlanSchema = new mongoose.Schema<PlanFields>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [PlanItemSchema],
  },
  { timestamps: true }
);

export const Plan = mongoose.model<PlanFields>('Plan', PlanSchema);
