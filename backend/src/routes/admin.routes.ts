import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js'

import { 
    deleteUser, 
    getAllUsers, 
    getUserById, 
    getUserCount, 
    updateUser 
} from '../controllers/user.controller.js';
import { getArticleCount } from '../controllers/article.controller.js';
import { getAllInterests } from '../controllers/interest.controller.js';
import { getAllPlans, getPlanByUserId, exportPlans, exportPlansCSV } from '../controllers/plan.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(verifyToken, verifyAdmin)

router.get('/users', getAllUsers)
router.get('/users/count', getUserCount)
router.get('/users/:id', getUserById)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

router.get('/articles/count', getArticleCount)

// Interests (admin support / export)
router.get('/interests', getAllInterests)

// Plans admin endpoints
router.get('/plans', getAllPlans) // paginated
router.get('/plans/:userId', getPlanByUserId)
router.get('/plans-export', exportPlans)
router.get('/plans-export-csv', exportPlansCSV)

export default router;
