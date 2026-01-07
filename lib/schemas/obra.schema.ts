import { z } from "zod"

/**
 * Schema de validación para creación de obra
 */
export const crearObraSchema = z.object({
  numero: z.string().min(1, "El número es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  ano: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
  observaciones: z.string().optional(),
  estado: z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"]).optional(),
})

/**
 * Schema de validación para actualización de obra
 */
export const actualizarObraSchema = z.object({
  numero: z.string().min(1).optional(),
  nombre: z.string().min(1).optional(),
  ano: z.number().int().min(2000).max(2100).optional(),
  mes: z.number().int().min(1).max(12).optional(),
  observaciones: z.string().optional(),
  estado: z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"]).optional(),
})

/**
 * Schema de validación para filtros de búsqueda de obras
 */
export const filtrarObrasSchema = z.object({
  search: z.string().optional(),
  ano: z.string().optional(),
  mes: z.string().optional(),
  estado: z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"]).optional(),
  responsable: z.enum(["ENGINEER", "ACCOUNTANT", "BOTH"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

