import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
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

export const Interest = mongoose.model("Interest", interestSchema);