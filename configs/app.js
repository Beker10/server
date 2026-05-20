'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import authRoutes from '../src/auth/auth.routes.js';
import postRoutes from '../src/posts/post.routes.js';
import commentRoutes from '../src/comments/comment.routes.js';
import { handleErrors } from '../middlewares/handle-errors.js';
import teamRoutes from '../src/teams/team.routes.js';
import matchRoutes from '../src/matches/match.routes.js';
import userRoutes from '../src/users/user.routes.js';
import historyRoutes from '../src/history/history.routes.js';
import notificationRoutes from '../src/notifications/notification.routes.js';
import tournamentRoutes from '../src/tournaments/tournament.routes.js';
import { deleteFileOnError } from '../middlewares/delete-file-on-error.js';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tournaments', tournamentRoutes)

app.use(deleteFileOnError);
app.use(handleErrors);

export const initServer = async () => {
    try {
        await dbConnection();
        
        // Only listen if not in Vercel
        if (process.env.VERCEL !== '1') {
            app.listen(process.env.PORT, () => {
                console.log(`Server running on port ${process.env.PORT}`)
            })
        }
    } catch (error) {
        console.log(`Error al iniciar el servidor: ${error}`);
    }
}

export default app;