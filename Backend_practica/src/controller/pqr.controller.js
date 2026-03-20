import { allPqr, getPqrById, getBitacoraByPqr, updateEstadoPqr, addBitacoraEntry, addBitacoraArchivos, addPqrArchivos, getPqrArchivos, findOrCreateCliente, generarRadicado, createPqr } from "../repositories/pqr.repository.js"

// GET /api/pqr — Obtiene todas las PQRs con datos del cliente
export const getPqr = async (req, res) => {
    try {
        const resultado = await allPqr()
        return res.status(200).json(resultado)
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al obtener PQRs" })
    }
}

// GET /api/pqr/:id — Obtiene una PQR específica con su bitácora y archivos adjuntos
export const getPqrDetail = async (req, res) => {
    try {
        const { id } = req.params
        const pqr = await getPqrById(id)
        if (!pqr) {
            return res.status(404).json({ message: "PQR no encontrada" })
        }
        const [bitacora, archivos] = await Promise.all([
            getBitacoraByPqr(id),
            getPqrArchivos(id),
        ])
        return res.status(200).json({ ...pqr, bitacora, archivos })
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al obtener la PQR" })
    }
}

// PATCH /api/pqr/:id/estado — Actualiza el estado de una PQR
export const updateEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado, id_tipo_evento, descripcion } = req.body
        const id_usuario = req.user.id_usuario || req.user.id

        // id_tipo_evento es opcional: el repository usará un fallback si no se provee
        if (!id_estado) {
            return res.status(400).json({ message: "id_estado es requerido" })
        }

        const resultado = await updateEstadoPqr(id, id_estado, id_usuario, id_tipo_evento, descripcion)
        return res.status(200).json({ message: "Estado actualizado", ...resultado })
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al actualizar estado" })
    }
}

// POST /api/pqr/public — Crea una PQR desde el formulario público (sin autenticación)
export const createPqrPublic = async (req, res) => {
    try {
        const {
            nombre, apellido, cedula, direccion, correo, celular,
            id_canal, id_tipo_peticion, id_municipio,
            fecha_reporte, fecha_evento, descripcion, acepta_terminos,
            // Datos opcionales del vendedor — se almacenan en columnas propias de pqr
            nombre_vendedor, cedula_vendedor, celular_vendedor,
        } = req.body

        // Validaciones mínimas
        if (!nombre || !cedula || !id_canal || !id_tipo_peticion || !fecha_reporte || !descripcion) {
            return res.status(400).json({ message: "Faltan campos obligatorios." })
        }

        if (!acepta_terminos) {
            return res.status(400).json({ message: "Debe aceptar los términos y condiciones." })
        }

        // Buscar o crear cliente
        const id_cliente = await findOrCreateCliente({
            nombre, apellido: apellido || "", cedula,
            direccion: direccion || "", correo: correo || "", celular: celular || "",
        })

        // Generar radicado único
        const radicado = await generarRadicado()

        // Crear la PQR con los campos del vendedor en sus columnas correspondientes
        const pqr = await createPqr({
            id_cliente, id_canal, id_tipo_peticion, id_municipio,
            fecha_reporte, fecha_evento, descripcion: descripcion.trim(),
            acepta_terminos: true, radicado,
            vendedor_cedula:  cedula_vendedor  || null,
            vendedor_nombre:  nombre_vendedor  || null,
            vendedor_celular: celular_vendedor || null,
        })

        if (req.files && req.files.length > 0) {
            await addPqrArchivos(pqr.id_pqr, req.files)
        }

        return res.status(201).json({ radicado: pqr.radicado, id_pqr: pqr.id_pqr })
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al registrar la PQR." })
    }
}

// POST /api/pqr/:id/bitacora — Agrega una entrada de gestión a la bitácora (con archivos opcionales)
export const addBitacora = async (req, res) => {
    try {
        const { id } = req.params
        const { id_tipo_evento, descripcion } = req.body
        const id_usuario = req.user.id_usuario || req.user.id

        if (!id_tipo_evento || !descripcion?.trim()) {
            return res.status(400).json({ message: "id_tipo_evento y descripcion son requeridos" })
        }

        const entrada = await addBitacoraEntry(id, id_usuario, id_tipo_evento, descripcion)

        if (req.files && req.files.length > 0) {
            await addBitacoraArchivos(entrada.id_bitacora, req.files)
        }

        return res.status(201).json(entrada)
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al agregar entrada a bitácora" })
    }
}
