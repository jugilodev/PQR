import jwt from 'jsonwebtoken'
import { logger } from '../utils/loggers.js'

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "No autorizado"
        })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decode)
        req.user = decode
        logger.info(`Usuario autenticado con id: ${decode.id_usuario} y rol: ${decode.rol}`)
        logger.info(req.user)
        next()
    } catch (err) {
        return res.status(500).json({
            message: "token invalido"
        })
    }
} 