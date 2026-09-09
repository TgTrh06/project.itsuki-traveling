import mongoose from "mongoose";
import type { InterestFields } from "../types/models.js";

const interestSchema = new mongoose.Schema<InterestFields>(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {  timestamps: true }
);

export const Interest = mongoose.model<InterestFields>("Interest", interestSchema);
