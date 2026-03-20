import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import loginRoutes from './routes/auth.routes.js'
import pqrRoutes from './routes/pqr.routes.js'
import catalogosRoutes from './routes/catalogos.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

// Servir archivos subidos (imágenes, PDFs, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

connectDB()

app.use("/api/usuarios", usuariosRoutes)
app.use("/", loginRoutes)
app.use("/api/pqr", pqrRoutes)
app.use("/api/catalogos", catalogosRoutes)

app.listen(process.env.PORT_SERVER, () => {
    console.log("Escuchando en el servidor", process.env.PORT_SERVER)
})
