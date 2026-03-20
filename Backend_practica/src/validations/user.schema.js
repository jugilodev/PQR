import { z } from "zod"

export const createUserSchema = z.object({
    nombre: z.string().min(3, "Nombre muy corto"),
    email: z.string().email("Correo incorrecto"),
    celular: z.string().min(10, "Celular inválido"),
    password: z
        .string()
        .min(7, "Mínimo 7 caracteres")
        .regex(/[A-Z]/, "Debe tener una mayúscula")
        .regex(/[0-9]/, "Debe tener un número")
        .regex(/[^A-Za-z0-9]/, "Debe tener un carácter especial")
})