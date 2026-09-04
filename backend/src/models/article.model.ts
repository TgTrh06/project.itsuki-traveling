import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        summary: {
            type: String,
            required: true
        },
        content: {
            type: String
        },
        imageUrl: {
            type: String
        },
        location: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String }
        },
        meta: {
            views: { type: Number, default: 0 },
            // Stores user list that liked the article
            likes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        destination: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Destination",
            required: true,
        },
        interests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Interest",
                required: true,
            }
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            }
        ]
    },
    { timestamps: true }
);

export const Article = mongoose.model("Article", articleSchema);