import jwt from 'jsonwebtoken'

export const validateJWT = (req, res, next) => {
    let token = req.headers['authorization'] || req.headers['x-token'] || (req.body && req.body.token) || req.query.token;

    if (!token) {
        return res.status(401).json({
            message: 'Es necesario el token de authorization'
        })
    }
    // console.log(token) // Reducing noise
    try {
        // Limpiamos el token de posibles comillas o espacios que Thunder Client / Postman a veces agregan por accidente
        token = token.replace(/^Bearer\s+/i, "").replace(/['"]+/g, '').trim();

        const decoded = jwt.verify(token, process.env.TOKEN_KEY)
        req.uid = decoded.uid
    } catch (error) {
        return res.status(401).json({
            message: 'Token no válido, rechazado a que fue modificado'
        })
    }
    return next()
}