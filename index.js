import { initServer, createApp } from './configs/app.js';

// For local development
if (process.env.VERCEL !== '1') {
    initServer();
}

// Export for Vercel - call the function to get the app
export default createApp();