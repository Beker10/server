import 'dotenv/config';
import { initServer, app } from './configs/app.js';
import { dbConnection } from './configs/db.js';

// For local development
if (process.env.VERCEL !== '1') {
    initServer();
} else {
    await dbConnection();
}

// Export for Vercel
export default app;