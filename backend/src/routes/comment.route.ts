import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
    addComment,
    getCommentsByArticle,
    deleteComment,
    updateComment
} from "../controllers/comment.controller.js";

const router = express.Router();

// Get comments for an article
router.get("/article/:articleId", getCommentsByArticle);

// Create a comment (requires authentication)
router.post("/:id", verifyToken, addComment);

// Update a comment (requires authentication)
router.put("/:id", verifyToken, updateComment);

// Delete a comment (requires authentication)
router.delete("/:id", verifyToken, deleteComment);

export default router;
