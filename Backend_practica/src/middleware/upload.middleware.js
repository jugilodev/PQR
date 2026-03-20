import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function makeUpload(subdir) {
    const dir = path.join(__dirname, `../../uploads/${subdir}`)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, dir),
        filename: (req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            cb(null, `${unique}${path.extname(file.originalname)}`)
        }
    })

    return multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB por archivo
        fileFilter: (req, file, cb) => {
            if (ALLOWED_TYPES.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
            }
        }
    })
}

export const upload     = makeUpload('bitacora')  // para entradas de bitácora
export const uploadPqr  = makeUpload('pqr')       // para archivos de la PQR inicial
