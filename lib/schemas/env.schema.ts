import { z } from "zod"

/**
 * Schema de validación para variables de entorno
 */
export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET es requerida"),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VERCEL: z.string().optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.string().default("10485760"), // 10MB
})

/**
 * Valida y parsea las variables de entorno
 */
export function validateEnv() {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      UPLOAD_DIR: process.env.UPLOAD_DIR,
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Error en variables de entorno:")
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })
    }
    throw new Error("Variables de entorno inválidas")
  }
}

