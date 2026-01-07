import { z } from "zod"

/**
 * Validaciones compartidas entre cliente y servidor
 */

export const emailSchema = z.string().email("Email inválido")

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")

export const obraNumeroSchema = z.string().min(1, "El número es requerido")

export const obraNombreSchema = z.string().min(1, "El nombre es requerido")

export const añoSchema = z.number().int().min(2000).max(2100)

export const mesSchema = z.number().int().min(1).max(12)

export const estadoObraSchema = z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"])

export const estadoProcesoSchema = z.enum(["NO_INICIADO", "EN_CURSO", "EN_REVISION", "APROBADO"])

export const responsableSchema = z.enum(["ENGINEER", "ACCOUNTANT", "BOTH"])

export const roleSchema = z.enum(["ADMIN", "ENGINEER", "ACCOUNTANT", "VIEWER"])

