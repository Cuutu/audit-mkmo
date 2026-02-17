/**
 * Validadores reutilizables para APIs
 */

import { NextResponse } from "next/server"
import { badRequest } from "./api-response"

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i

/** Valida que un string sea un ObjectId de MongoDB válido (24 hex) */
export function isMongoObjectId(id: unknown): id is string {
  return typeof id === "string" && OBJECT_ID_REGEX.test(id)
}

/** Alias para compatibilidad */
export const isValidObjectId = isMongoObjectId

/**
 * Valida ObjectId y retorna NextResponse 400 si es inválido.
 * Uso: const err = requireObjectId(params.id); if (err) return err;
 */
export function requireObjectId(id: unknown): NextResponse | null {
  if (isMongoObjectId(id)) return null
  return badRequest("ID inválido")
}

/** Sanitiza filename para Content-Disposition (evita injection en headers, RFC) */
export function safeContentDispositionFilename(filename: string): string {
  return filename
    .replace(/[\r\n"]/g, "")
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "_")
    .slice(0, 255)
    .trim() || "archivo"
}

/** @deprecated Usar safeContentDispositionFilename */
export const sanitizeContentDispositionFilename = safeContentDispositionFilename
