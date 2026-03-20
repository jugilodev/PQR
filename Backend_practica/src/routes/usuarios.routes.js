import { Router } from "express";
import { createUsuarios, getUsuarios } from '../controller/usuarios.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.js'
import { createUserSchema } from '../validations/user.schema.js'
import { isAdmin } from '../middleware/validateAdmin.middleware.js'


const router = Router()

router.post('/', authMiddleware, isAdmin, validate(createUserSchema), createUsuarios)
//router.post('/', createUsuarios)
router.get('/', authMiddleware, getUsuarios)


export default router