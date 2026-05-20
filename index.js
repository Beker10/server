import dns from 'dns';
import { initServer, createApp } from './configs/app.js';

// Set Cloudflare and Google DNS as resolver (for local only)
if (process.env.VERCEL !== '1') {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    initServer();
}

// Export for Vercel - call the function to get the app
export default createApp();