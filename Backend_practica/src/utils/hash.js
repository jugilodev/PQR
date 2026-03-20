import bcrypt from 'bcrypt'

export const createHash = async (password, salt = 10) => {
    return await bcrypt.hash(password, salt)
}

export const compareHash = async (password, passwordUser) => {
    return await bcrypt.compare(password, passwordUser)
}