import 'dotenv/config';
import { initServer, app } from './configs/app.js';

// For local development
if (process.env.VERCEL !== '1') {
    initServer();
}

// Export for Vercel
export default app;
// force restart nodemon