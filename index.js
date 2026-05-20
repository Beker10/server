import dns from 'dns';
import { initServer, app } from './configs/app.js';

// Set Cloudflare and Google DNS as resolver (for local)
dns.setServers(['1.1.1.1', '8.8.8.8']);

// For local development
if (process.env.VERCEL !== '1') {
    initServer();
}

// Export for Vercel
export default app;