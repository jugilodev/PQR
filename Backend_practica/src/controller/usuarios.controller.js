import { findUserByEmail, createUser, allUser } from '../repositories/user.repository.js'
import { createHash } from '../utils/hash.js'
import { logger } from '../utils/loggers.js'



export const createUsuarios = async (req, res) => {
    const { nombre, email, celular, password } = req.body
    logger.info(`Creando usuario con email: ${email} y celular: ${celular}`)
    try {
        const result = await findUserByEmail(email, celular)
        logger.info("Resultado de la busqueda de usuario: ", result)
        logger.info(`Cantidad de usuarios encontrados: ${result.length}`)
        if (result.length > 0) {

            logger.warn(`Usuaario ya existente con ${email} o ${celular}`)
            return res.status(400).json({
                message: "Ya existe un usuario con ese numero o email registrados"
            })
        }
        logger.info("No se encontraron usuarios con ese email o celular, procediendo a crear el usuario")
        const hash = await createHash(password, 10)
        logger.info("No se encontraron usuarios con ese email o celular, procediendo a crear el usuario")
        const user = await createUser(nombre, email, celular, hash)
        logger.info(user)
        res.status(201).json({ user })
        logger.info("No se encontraron usuarios con ese email o celular, procediendo a crear el usuario")

    } catch (err) {

        logger.error(err, "Error al crear el usuario")
        res.status(500).json({
            message: "Error al crear el usuario"
        })

    }

}

export const getUsuarios = async (req, res) => {
    try {

        const result = await allUser()
        logger.info(result)

        if (result.length === 0) {
            return res.status(200).json([])

        }
        return res.status(200).json(result)

    } catch (err) {
        return res.status(500).json({
            message: "Errorr"
        })
    }
}