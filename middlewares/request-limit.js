import rateLimit from "express-rate-limit";

const windowMs = 5 * 60 * 1000;
const max = 10000; // Desactivado prácticamente para pruebas

export const publicLimiter = rateLimit({
    windowMs,
    max,
    message: `Demasiados intentos. Intenta más tarde.`,
    standarHeaders: true,
    legacyHeaders: false,
});

export const authtenticatedLimiter = rateLimit({
    windowMs,
    max,
    message: `Demasiados intentos. Intenta más tarde.`,
    standarHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `uid:${req.uid}`
});

export const apiLimiter = rateLimit({
    windowMs,
    max: 10000,
    message: `Has superado el límite de lecturas. Intenta en 5 minutos.`,
    standarHeaders: true,
    legacyHeaders: false,
});