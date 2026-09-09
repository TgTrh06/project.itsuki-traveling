import mongoose from "mongoose";
import type { FilterQuery } from "mongoose";
import type { Request, Response } from "express";
import { Article } from "../models/article.model.js";
import { Comment } from "../models/comment.model.js";
import { Destination } from "../models/destination.model.js";
import slugify from "../utils/slugify.js";
import type { ArticleFields } from "../types/models.js";

const messageOf = (error: unknown) =>
    error instanceof Error ? error.message : "Unexpected error";

const queryString = (value: unknown) => typeof value === "string" ? value : undefined;
const queryNumber = (value: unknown, fallback: number) => {
    const parsed = Number(queryString(value));
    return Number.isFinite(parsed) ? parsed : fallback;
};

// Get all articles
export const getAllArticles = async (req: Request, res: Response) => {
    try {
        const filter: FilterQuery<ArticleFields> = {};
        const destinationQuery = queryString(req.query.destination);

        // Handle destination filter (can be ID or slug)
        if (destinationQuery) {
            let destination;
            // Try to find by ID first if it looks like a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(destinationQuery)) {
                destination = await Destination.findById(destinationQuery);
            }
            // Otherwise find by slug
            if (!destination) {
                destination = await Destination.findOne({ slug: destinationQuery });
            }
            if (destination) {
                filter.destination = destination._id;
            }
        }

        const authorQuery = queryString(req.query.author);
        if (authorQuery) filter.author = authorQuery;

        // Handle interest filter (can be ID or slug)
        const interestQuery = queryString(req.query.interest);
        if (interestQuery) {
            const { Interest } = await import("../models/interest.model.js");
            let interest;
            // Try to find by ID first if it looks like a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(interestQuery)) {
                interest = await Interest.findById(interestQuery);
            }
            // Otherwise find by slug
            if (!interest) {
                interest = await Interest.findOne({ slug: interestQuery });
            }
            if (interest) {
                filter.interests = interest._id;
            }
        }

        const page = Math.max(queryNumber(req.query.page, 1), 1);
        const limit = Math.max(queryNumber(req.query.limit, 10), 1);
        const skip = (page - 1) * limit;

        let sort: Record<string, 1 | -1> = { createdAt: -1 };
        if (queryString(req.query.sort) === 'views') {
            sort = { 'meta.views': -1 };
        }

        const total = await Article.countDocuments(filter);
        const articles = await Article.find(filter)
            .populate("author", "name email")
            .populate("destination", "title slug")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const pages = Math.ceil(total / limit) || 1;

        res.status(200).json({ data: articles, total, page, pages });
    } catch (error) {
        res.status(500).json({ message: messageOf(error) });
    }
};

// Get article by ID
export const getArticleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id)
            .populate("author", "name email")
            .populate("destination", "title slug");

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json({ article });
    } catch (error) {
        res.status(500).json({ message: messageOf(error) });
    }
};

// Get article by slug
export const getArticleByCityAndSlug = async (req: Request, res: Response) => {
    try {
        const { citySlug, articleSlug } = req.params;

        // Find destination by slug
        const destination = await Destination.findOne({ slug: citySlug });
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        // Find article by slug and destination and increment view atomically
        const article = await Article.findOneAndUpdate(
            {
                slug: articleSlug,
                destination: destination._id
            },
            { $inc: { 'meta.views': 1 } },
            { new: true }
        ).populate("author", "name avatar").populate("destination", "title");

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Get comments of current article
        const comments = await Comment.find({ article: article._id })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });

        // Return both article and comments as an object
        res.status(200).json({ article, comments });
    } catch (error) {
        res.status(500).json({ message: messageOf(error) });
    }
};

// Create an article
export const createArticle = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Authentication required" });
        // Handle multipart/form-data fields and file
        let { title, summary, content, imageUrl, destination, interests, location } = req.body || {}

        // If interests or location are sent as JSON strings, parse them
        try {
            if (typeof interests === 'string' && interests.trim()) {
                interests = JSON.parse(interests)
            }
        } catch (e) {
            // fallback: comma separated
            interests = typeof interests === 'string' ? interests.split(',').map((s: string) => s.trim()).filter(Boolean) : interests
        }

        try {
            if (typeof location === 'string' && location.trim()) {
                location = JSON.parse(location)
            }
        } catch (e) {
            location = location
        }

        // If a file was uploaded, prefer that as imageUrl (make absolute URL)
        if (req.file) {
            const host = req.get('host')
            const protocol = req.protocol
            imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`
        }

        if (!title) { return res.status(400).json({ success: false, message: "Article title is required" }) };
        if (!summary) { return res.status(400).json({ success: false, message: "Article summary is required" }) };
        if (!content) { return res.status(400).json({ success: false, message: "Article content is required" }) };
        if (!destination) { return res.status(400).json({ success: false, message: "Article destination is required" }) };
        if (!interests || (Array.isArray(interests) && interests.length === 0)) { return res.status(400).json({ success: false, message: "Article interest is required" }) };

        // Require location with lat & lng
        if (!location || typeof location !== 'object' || !location.lat || !location.lng) {
            return res.status(400).json({ success: false, message: "Article location is required. Please select a point on the map." });
        }

        const article = await Article.create({
            title,
            slug: slugify(title),
            summary,
            content,
            imageUrl,
            author: req.user._id,
            destination,
            interests: interests,
            location
        });

        // Add article reference to destination
        await Destination.findByIdAndUpdate(destination, { $push: { articles: article._id } });

        res.status(201).json({
            success: true,
            message: "Article created successfully",
            article
        });
    } catch (error) {
        res.status(400).json({ message: messageOf(error) });
    }
};

// Update article
export const updateArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const data = req.body || {}

        // Parse JSON fields if necessary
        if (typeof data.interests === 'string') {
            try { data.interests = JSON.parse(data.interests) } catch (e) { data.interests = data.interests.split(',').map((s: string) => s.trim()).filter(Boolean) }
        }
        if (typeof data.location === 'string') {
            try { data.location = JSON.parse(data.location) } catch (e) { data.location = data.location }
        }

        // If file uploaded, set imageUrl (absolute)
        if (req.file) {
            const host = req.get('host')
            const protocol = req.protocol
            data.imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`
        }

        // If location is being updated ensure lat/lng present
        if (!data.location || typeof data.location !== 'object' || !data.location.lat || !data.location.lng) {
            return res.status(400).json({ success: false, message: 'Article location is required. Please select a point on the map.' })
        }
        const updated = await Article.findByIdAndUpdate(id, data, { new: true });

        if (!updated) return res.status(404).json({ message: 'Article not found' });

        res.status(200).json({
            success: true,
            message: "Article updated successfully",
            article: updated
        });
    } catch (error) {
        res.status(400).json({ message: messageOf(error) });
    }
};

// Delete article
export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const article = await Article.findByIdAndDelete(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        // Remove reference from destination
        await Destination.findByIdAndUpdate(article.destination, { $pull: { articles: article._id } });

        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: messageOf(error) });
    }
};

// Toggle like the article
export const likeArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        if (!req.user) return res.status(401).json({ message: "Authentication required" });
        const userId = req.user._id;
        article.meta = article.meta || {};
        article.meta.likes = article.meta.likes || [];

        const isLiked = article.meta.likes.find((u) => u.toString() === userId.toString());
        if (isLiked) {
            article.meta.likes = article.meta.likes.filter((u) => u.toString() !== userId.toString());
        } else {
            article.meta.likes.push(userId);
        }

        await article.save();

        res.status(200).json({ likesCount: article.meta.likes.length });
    } catch (error) {
        res.status(400).json({ message: messageOf(error) });
    }
};

export const getArticleCount = async (req: Request, res: Response) => {
    const authorId = queryString(req.query.authorId);

    if (authorId && authorId !== 'undefined') {
        const count = await Article.countDocuments({ author: authorId })
        return res.json({ count })
    }

    const count = await Article.countDocuments()
    res.json({ count })
};

