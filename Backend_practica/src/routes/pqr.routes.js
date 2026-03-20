import { Router } from 'express'
import { getPqr, getPqrDetail, updateEstado, addBitacora, createPqrPublic } from '../controller/pqr.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { upload, uploadPqr } from '../middleware/upload.middleware.js'

const router = Router()

// Ruta pública: formulario de radicación de PQRs (sin autenticación)
// IMPORTANTE: debe ir antes de '/:id' para no ser capturada por ese patrón
router.post('/public', uploadPqr.array('archivos', 5), createPqrPublic)

// Rutas protegidas: requieren sesión activa
router.get('/',               authMiddleware, getPqr)
router.get('/:id',            authMiddleware, getPqrDetail)
router.patch('/:id/estado',   authMiddleware, updateEstado)
router.post('/:id/bitacora',  authMiddleware, upload.array('archivos', 10), addBitacora)

export default router
