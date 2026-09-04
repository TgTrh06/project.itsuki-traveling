import express from "express";
import { 
    getAllDestinations,
    getDestinationBySlug, 
    updateDestination
} from "../controllers/destination.controller.js";

const router = express.Router();

// General
router.get("/", getAllDestinations);
router.get("/:slug", getDestinationBySlug);

// Admin only
router.put("/:id", updateDestination);

export default router;