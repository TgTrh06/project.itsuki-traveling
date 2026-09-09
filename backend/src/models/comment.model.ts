import mongoose from "mongoose";
import type { CommentFields } from "../types/models.js";

const commentSchema = new mongoose.Schema<CommentFields>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export const Comment = mongoose.model<CommentFields>("Comment", commentSchema);
