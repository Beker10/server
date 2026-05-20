'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import 'dotenv/config';
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

const middlewares = (app) => {
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

}

const routes = (app) => {
    app.use('/api/auth', authRoutes)
    app.use('/api/posts', postRoutes)
    app.use('/api/comments', commentRoutes);
    app.use('/api/teams', teamRoutes);
    app.use('/api/matches', matchRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/history', historyRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/tournaments', tournamentRoutes);
}

const conectarDB = async () => {
    try {
        await dbConnection();
    } catch (error) {
        console.log(`Error al conectar la db: ${error.message}`)
    }
}

// Lazy initialization for Vercel serverless
let app;

const createApp = () => {
    if (!app) {
        app = express();
        middlewares(app);
        routes(app);
        app.use(deleteFileOnError);
        app.use(handleErrors);
    }
    return app;
};

export const initServer = async () => {
    try {
        const app = createApp();
        await conectarDB()
        
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

export default createApp;