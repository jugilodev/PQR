import { getEstados, getTipoEvento, getTipoPeticion, getCanales, getMunicipios } from '../repositories/catalogos.repository.js'

// GET /api/catalogos/estados
export const listEstados = async (req, res) => {
    try {
        const data = await getEstados()
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// GET /api/catalogos/tipo_evento
export const listTipoEvento = async (req, res) => {
    try {
        const data = await getTipoEvento()
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// GET /api/catalogos/tipo_peticion
export const listTipoPeticion = async (req, res) => {
    try {
        const data = await getTipoPeticion()
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// GET /api/catalogos/canales
export const listCanales = async (req, res) => {
    try {
        const data = await getCanales()
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// GET /api/catalogos/municipios
export const listMunicipios = async (_req, res) => {
    try {
        const data = await getMunicipios()
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}
