import { Comment } from "../models/comment.model.js";
import { Article } from "../models/article.model.js";

// Get all comments for an article
export const getCommentsByArticle = async (req, res) => {
    try {
        const { articleId } = req.params;

        // Verify article exists
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        const comments = await Comment.find({ article: articleId })
            .populate("user", "name avatar email")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a comment
export const addComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const articleId = req.params.id;
        const { content } = req.body;

        // Verify article exists
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const comment = await Comment.create({
            user: userId,
            article: articleId,
            content: content.trim(),
        });

        await comment.populate("user", "name avatar email");

        article.comments.push(comment._id);
        await article.save();

        res.status(201).json({
            message: "Comment added",
            success: true,
            comment
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Only allow the comment author to update
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to update this comment" });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Comment content is required" });
        }

        comment.content = content.trim();
        await comment.save();

        const populatedComment = await comment.populate("user", "name avatar email");

        res.status(200).json(populatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Only allow the comment author to delete
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(id);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
