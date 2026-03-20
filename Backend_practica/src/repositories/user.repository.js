import { pool } from "../config/db.js";
import dotenv from 'dotenv'
import { logger } from "../utils/loggers.js";

// export const findUserByEmail = async (email, celular) => {
//     const result = await pool.query(`

//             SELECT * FROM public.usuarios
//             WHERE celular = $1 OR email = $2
//             `, [celular, email])

//     return result.rows
// }

// export const createUser = async (nombre, email, celular, hash) => {

//     const result = await pool.query(`
//         INSERT INTO public.usuarios(nombre, email, celular, password)
//                 VALUES ($1,$2,$3, $4)
//                 RETURNING *
//         `, [nombre, email, celular, hash])

//     return result.rows[0]
// }

// export const allUser = async () => {

//     const result = await pool.query(`
//         SELECT * FROM public.usuarios
//         `)

//     return result.rows[0]
// }

// export const emailUser = async (email) => {

//     logger.info(`Buscando usuario con email: ${email}`)

//     const result = await pool.query(`
//         SELECT * FROM public.usuarios
//         WHERE email = $1
//         `, [email])
//     logger.info(result.rows)
//     return result.rows
// }

export const findUserByEmail = async (correo, celular) => {
    const result = await pool.query(`

            SELECT * FROM public.usuarios
            WHERE celular = $1 OR correo = $2
            `, [celular, correo])

    return result.rows
}

export const createUser = async (nombre, email, celular, hash) => {

    const result = await pool.query(`
        INSERT INTO public.usuarios(nombre, rol, area, activo, password_hash, correo, celular)
                VALUES ($1,$2,$3, $4, $5, $6, $7)
                RETURNING *
        `, [nombre, "asesora", "atencion al cliente", true, hash, email, celular])

    return result.rows[0]
}

export const allUser = async () => {

    const result = await pool.query(`
        SELECT * FROM public.usuarios
        `)

    return result.rows
}

export const emailUser = async (email) => {

    logger.info(`Buscando usuario con email: ${email}`)

    const result = await pool.query(`
        SELECT * FROM public.usuarios
        WHERE correo = $1
        `, [email])
    logger.info(result.rows)
    return result.rows
}

export const getUserById = async (id) => {
    const result = await pool.query(
        `SELECT id_usuario, nombre, rol, area, correo FROM public.usuarios WHERE id_usuario = $1`,
        [id]
    )
    return result.rows[0]
}