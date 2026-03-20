import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pkg

export const pool = new Pool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB,
    port: process.env.PORT_DB
})

export const connectDB = async () => {
    try {
        const res = await pool.connect()
        console.log("Connect DB successful")
        res.release()
    } catch (error) {
        console.error("Error connection DB", error)
        process.exit(1)
    }
}

