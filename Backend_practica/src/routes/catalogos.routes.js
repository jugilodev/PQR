import { Router } from 'express'
import { listEstados, listTipoEvento, listTipoPeticion, listCanales, listMunicipios } from '../controller/catalogos.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

// Catálogos protegidos (solo para usuarios internos)
router.get('/estados',     authMiddleware, listEstados)
router.get('/tipo_evento', authMiddleware, listTipoEvento)

// Catálogos públicos (necesarios para el formulario de radicación de PQRs)
router.get('/tipo_peticion', listTipoPeticion)
router.get('/canales',       listCanales)
router.get('/municipios',    listMunicipios)

export default router
