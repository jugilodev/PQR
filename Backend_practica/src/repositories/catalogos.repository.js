import { pool } from '../config/db.js'

// Obtiene todos los estados disponibles para una PQR
export const getEstados = async () => {
    const result = await pool.query(`SELECT id_estado, tipo_estado FROM public.estados ORDER BY tipo_estado`)
    return result.rows
}

// Obtiene todos los tipos de evento activos (para el formulario de bitácora)
export const getTipoEvento = async () => {
    const result = await pool.query(`SELECT id_tipo_evento, nombre, descripcion FROM public.tipo_evento WHERE activo = true ORDER BY nombre`)
    return result.rows
}

// Obtiene todos los tipos de petición
export const getTipoPeticion = async () => {
    const result = await pool.query(`SELECT id_tipo_peticion, tipo_peticion FROM public.tipo_peticion ORDER BY tipo_peticion`)
    return result.rows
}

// Obtiene todos los canales disponibles
export const getCanales = async () => {
    const result = await pool.query(`SELECT id_canal, tipo_canal FROM public.canal ORDER BY tipo_canal`)
    return result.rows
}

// Obtiene todos los municipios disponibles
export const getMunicipios = async () => {
    const result = await pool.query(`SELECT id_municipio, nombre FROM public.municipio ORDER BY nombre`)
    return result.rows
}
