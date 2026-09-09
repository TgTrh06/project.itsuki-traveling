import express from "express"
import { getAllInterests, getInterestBySlug, createInterest, updateInterest, deleteInterest } from "../controllers/interest.controller.js"
import { verifyAdmin, verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", getAllInterests)
router.get("/:slug", getInterestBySlug)
router.post("/", verifyToken, verifyAdmin, createInterest)
router.put("/:id", verifyToken, verifyAdmin, updateInterest)
router.delete("/:id", verifyToken, verifyAdmin, deleteInterest)

export default router
