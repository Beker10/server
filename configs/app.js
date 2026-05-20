'use strict';

import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

export const initServer = async () => {
    // Only listen if not in Vercel
    if (process.env.VERCEL !== '1') {
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    }
}

export default app;