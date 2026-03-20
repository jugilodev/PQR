import { pool } from '../config/db.js'

export const allPqr = async () => {
    const respuesta = await pool.query(`

            SELECT
        p.radicado,
        p.fecha_reporte,
        p.fecha_evento,
        p.vendedor_cedula,
        p.vendedor_nombre,
        p.vendedor_celular,
        c2.nombre,
        c2.apellido,
        c2.celular,
        c2.correo,
        c2.direccion,
        c2.cedula,
        p.id_pqr,
        p.descripcion,
        e.tipo_estado,
        tp.tipo_peticion,
        c.tipo_canal
    FROM public.pqr p
    JOIN public.estados e ON e.id_estado = p.id_estado
    JOIN public.tipo_peticion tp ON tp.id_tipo_peticion = p.id_tipo_peticion
    JOIN public.canal c ON c.id_canal = p.id_canal
    JOIN public.cliente c2 ON c2.id_cliente = p.id_cliente
        
        `)

    return respuesta.rows
}

// Obtiene una PQR por ID con todos sus datos relacionados
export const getPqrById = async (id_pqr) => {
    const result = await pool.query(`
        SELECT
            p.id_pqr, p.radicado, p.fecha_reporte, p.fecha_evento, p.descripcion, p.acepta_terminos,
            p.vendedor_cedula, p.vendedor_nombre, p.vendedor_celular,
            e.id_estado, e.tipo_estado,
            tp.id_tipo_peticion, tp.tipo_peticion,
            c.id_canal, c.tipo_canal,
            cl.id_cliente, cl.nombre AS cliente_nombre, cl.apellido, cl.celular,
            cl.correo AS cliente_correo, cl.direccion, cl.cedula,
            m.nombre AS municipio
        FROM public.pqr p
        JOIN public.estados e ON e.id_estado = p.id_estado
        JOIN public.tipo_peticion tp ON tp.id_tipo_peticion = p.id_tipo_peticion
        JOIN public.canal c ON c.id_canal = p.id_canal
        JOIN public.cliente cl ON cl.id_cliente = p.id_cliente
        LEFT JOIN public.municipio m ON m.id_municipio = p.id_municipio
        WHERE p.id_pqr = $1
    `, [id_pqr])
    return result.rows[0]
}

// Obtiene todas las entradas de bitácora de una PQR, incluyendo archivos adjuntos
export const getBitacoraByPqr = async (id_pqr) => {
    const result = await pool.query(`
        SELECT
            b.id_bitacora, b.descripcion, b.estado_anterior, b.estado_nuevo,
            b.fecha_evento, b.created_at,
            te.nombre AS tipo_evento,
            u.nombre AS usuario_nombre, u.rol AS usuario_rol, u.area AS usuario_area,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', a.id,
                        'nombre_original', a.nombre_original,
                        'ruta_archivo', a.ruta_archivo,
                        'tipo_mime', a.tipo_mime
                    )
                ) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) AS archivos
        FROM public.pqr_bitacora b
        JOIN public.tipo_evento te ON te.id_tipo_evento = b.id_tipo_evento
        JOIN public.usuarios u ON u.id_usuario = b.id_usuario
        LEFT JOIN public.pqr_bitacora_archivos a ON a.id_bitacora = b.id_bitacora
        WHERE b.id_pqr = $1
        GROUP BY b.id_bitacora, te.nombre, u.nombre, u.rol, u.area
        ORDER BY b.created_at DESC
    `, [id_pqr])
    return result.rows
}

// Guarda los archivos adjuntos de una entrada de bitácora
export const addBitacoraArchivos = async (id_bitacora, archivos) => {
    for (const archivo of archivos) {
        await pool.query(`
            INSERT INTO public.pqr_bitacora_archivos (id_bitacora, nombre_original, ruta_archivo, tipo_mime, tamanio_bytes)
            VALUES ($1, $2, $3, $4, $5)
        `, [id_bitacora, archivo.originalname, `/uploads/bitacora/${archivo.filename}`, archivo.mimetype, archivo.size])
    }
}

// Guarda los archivos adjuntos de una PQR recién creada
export const addPqrArchivos = async (id_pqr, archivos) => {
    for (const archivo of archivos) {
        await pool.query(`
            INSERT INTO public.pqr_archivos (id_pqr, nombre_original, ruta_archivo, tipo_mime, tamanio_bytes)
            VALUES ($1, $2, $3, $4, $5)
        `, [id_pqr, archivo.originalname, `/uploads/pqr/${archivo.filename}`, archivo.mimetype, archivo.size])
    }
}

// Obtiene los archivos adjuntos de una PQR
export const getPqrArchivos = async (id_pqr) => {
    const result = await pool.query(`
        SELECT id, nombre_original, ruta_archivo, tipo_mime, tamanio_bytes, created_at
        FROM public.pqr_archivos
        WHERE id_pqr = $1
        ORDER BY created_at ASC
    `, [id_pqr])
    return result.rows
}

// Actualiza el estado de una PQR e inserta automáticamente una entrada en la bitácora.
// id_tipo_evento es opcional: si no se provee, se usa el primer tipo_evento activo disponible.
export const updateEstadoPqr = async (id_pqr, id_estado, id_usuario, id_tipo_evento, descripcion) => {
    // Obtener estado actual para registrar como estado_anterior
    const estadoActualRes = await pool.query(`
        SELECT e.tipo_estado FROM public.pqr p
        JOIN public.estados e ON e.id_estado = p.id_estado
        WHERE p.id_pqr = $1
    `, [id_pqr])
    const estadoAnterior = estadoActualRes.rows[0]?.tipo_estado || ""

    // Actualizar el estado de la PQR
    await pool.query(`UPDATE public.pqr SET id_estado = $1 WHERE id_pqr = $2`, [id_estado, id_pqr])

    // Obtener el nombre del nuevo estado
    const estadoNuevoRes = await pool.query(`SELECT tipo_estado FROM public.estados WHERE id_estado = $1`, [id_estado])
    const estadoNuevo = estadoNuevoRes.rows[0]?.tipo_estado || ""

    // Si no se proporcionó tipo_evento, usar el primero disponible como fallback
    let tipoEvento = id_tipo_evento
    if (!tipoEvento) {
        const fallback = await pool.query(`SELECT id_tipo_evento FROM public.tipo_evento WHERE activo = true ORDER BY id_tipo_evento LIMIT 1`)
        tipoEvento = fallback.rows[0]?.id_tipo_evento
    }

    // Insertar entrada en bitácora registrando el cambio
    await pool.query(`
        INSERT INTO public.pqr_bitacora (id_pqr, id_usuario, id_tipo_evento, descripcion, estado_anterior, estado_nuevo, fecha_evento)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [id_pqr, id_usuario, tipoEvento,
        descripcion || `Estado actualizado de "${estadoAnterior}" a "${estadoNuevo}"`,
        estadoAnterior, estadoNuevo])

    return { estadoAnterior, estadoNuevo }
}

// Busca un cliente por cédula; si no existe lo crea. Retorna el id_cliente.
export const findOrCreateCliente = async ({ nombre, apellido, cedula, direccion, correo, celular }) => {
    const existing = await pool.query(`SELECT id_cliente FROM public.cliente WHERE cedula = $1`, [cedula])
    if (existing.rows.length > 0) return existing.rows[0].id_cliente

    const inserted = await pool.query(`
        INSERT INTO public.cliente (nombre, apellido, cedula, direccion, correo, celular)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_cliente
    `, [nombre, apellido, cedula, direccion, correo, celular])
    return inserted.rows[0].id_cliente
}

// Genera el radicado con formato YYYYMM + secuencial de 3 dígitos dentro del mes.
export const generarRadicado = async () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm   = String(now.getMonth() + 1).padStart(2, "0")
    const prefijo = `${yyyy}${mm}`

    const res = await pool.query(
        `SELECT COUNT(*) AS total FROM public.pqr WHERE radicado LIKE $1`,
        [`${prefijo}%`]
    )
    const seq = parseInt(res.rows[0].total) + 1
    return `${prefijo}${String(seq).padStart(3, "0")}`
}

// Crea una PQR nueva (endpoint público).
export const createPqr = async ({ id_cliente, id_canal, id_tipo_peticion, id_municipio, fecha_reporte, fecha_evento, descripcion, acepta_terminos, radicado, vendedor_cedula, vendedor_nombre, vendedor_celular }) => {
    // Usar el primer estado disponible (ej: "Abierto") como estado inicial
    const estadoRes = await pool.query(`SELECT id_estado FROM public.estados ORDER BY id_estado LIMIT 1`)
    const id_estado = estadoRes.rows[0]?.id_estado

    const result = await pool.query(`
        INSERT INTO public.pqr
            (radicado, id_estado, id_tipo_peticion, id_canal, id_cliente, id_municipio,
             fecha_reporte, fecha_evento, descripcion, acepta_terminos,
             vendedor_cedula, vendedor_nombre, vendedor_celular)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id_pqr, radicado
    `, [radicado, id_estado, id_tipo_peticion, id_canal, id_cliente,
        id_municipio || null, fecha_reporte, fecha_evento || null, descripcion, acepta_terminos,
        vendedor_cedula || null, vendedor_nombre || null, vendedor_celular || null])

    return result.rows[0]
}

// Agrega una entrada de bitácora (gestión manual: correos, llamadas, etc.)
export const addBitacoraEntry = async (id_pqr, id_usuario, id_tipo_evento, descripcion) => {
    const result = await pool.query(`
        INSERT INTO public.pqr_bitacora (id_pqr, id_usuario, id_tipo_evento, descripcion, fecha_evento)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
    `, [id_pqr, id_usuario, id_tipo_evento, descripcion])
    return result.rows[0]
}