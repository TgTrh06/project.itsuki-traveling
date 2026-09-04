import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import planRateLimit from '../middleware/planRateLimit.js';
import {
	getMyPlan,
	upsertMyPlan,
	deleteMyPlan,
} from '../controllers/plan.controller.js';

const router = express.Router();

// All endpoints require authentication. Apply rate limiter to writes.
router.get('/', verifyToken, planRateLimit({ windowMs: 60 * 1000, max: 60 }), getMyPlan);
router.post('/', verifyToken, planRateLimit({ windowMs: 60 * 1000, max: 30 }), upsertMyPlan);
router.delete('/', verifyToken, planRateLimit({ windowMs: 60 * 1000, max: 10 }), deleteMyPlan);

export default router;
