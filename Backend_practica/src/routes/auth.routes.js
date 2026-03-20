import { Router } from 'express'
import { login, logout, getMe } from '../controller/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.get('/logout', logout)
// Endpoint para obtener el usuario autenticado actual
router.get('/api/auth/me', authMiddleware, getMe)

export default router
