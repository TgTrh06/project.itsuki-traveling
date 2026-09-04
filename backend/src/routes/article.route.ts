import express from "express";

import { verifyAdmin, verifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
    createArticle,
    deleteArticle,
    getAllArticles,
    getArticleById,
    getArticleByCityAndSlug,
    updateArticle,
    likeArticle
} from "../controllers/article.controller.js";

const router = express.Router();

// General
router.get("/", getAllArticles);
// More specific route (city + slug) must come before the generic id route
router.get("/:citySlug/:articleSlug", getArticleByCityAndSlug);
router.get("/:id", getArticleById);

// Admin only
router.post("/", verifyToken, verifyAdmin, upload.single('image'), createArticle);
router.put("/:id/edit", verifyToken, verifyAdmin, upload.single('image'), updateArticle);
router.delete("/:id", verifyToken, verifyAdmin, deleteArticle);

// Interact
router.post("/:id/like", verifyToken, likeArticle);

export default router;