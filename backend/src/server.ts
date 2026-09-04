import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path'

import { connectDB } from './config/db.js';

import authRouter from './routes/auth.route.js';
import destinationRouter from './routes/destination.route.js';
import articleRouter from './routes/article.route.js';
import commentRouter from './routes/comment.route.js';
import interestRouter from './routes/interest.route.js';
import adminRouter from './routes/admin.routes.js'
import planRouter from './routes/plan.route.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, // Set true is required since using JWT
}))

app.get('/', (req, res) => {
    res.send('Itsuki no Tabi API Running 🗾');
});

app.use('/api/auth', authRouter);
app.use('/api/destinations', destinationRouter);
app.use('/api/articles', articleRouter);
app.use('/api/comments', commentRouter);
app.use('/api/interests', interestRouter);
app.use('/api/admin', adminRouter)
app.use('/api/plans', planRouter)

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});