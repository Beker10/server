'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import 'dotenv/config';

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
        
        // Import routes lazily
        import('../src/auth/auth.routes.js').then(module => app.use('/api/auth', module.default));
        import('../src/posts/post.routes.js').then(module => app.use('/api/posts', module.default));
        import('../src/comments/comment.routes.js').then(module => app.use('/api/comments', module.default));
        import('../src/teams/team.routes.js').then(module => app.use('/api/teams', module.default));
        import('../src/matches/match.routes.js').then(module => app.use('/api/matches', module.default));
        import('../src/users/user.routes.js').then(module => app.use('/api/users', module.default));
        import('../src/history/history.routes.js').then(module => app.use('/api/history', module.default));
        import('../src/notifications/notification.routes.js').then(module => app.use('/api/notifications', module.default));
        import('../src/tournaments/tournament.routes.js').then(module => app.use('/api/tournaments', module.default));
        
        import('../middlewares/delete-file-on-error.js').then(module => app.use(module.default));
        import('../middlewares/handle-errors.js').then(module => app.use(module.default));
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