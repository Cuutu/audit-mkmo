/**
 * Helpers para respuestas JSON consistentes en APIs.
 */

import { NextResponse } from "next/server"

export interface ApiError {
  error: string
  code?: string
}

export function jsonError(message: string, status: number, code?: string): NextResponse {
  const body: ApiError = { error: message }
  if (code) body.code = code
  return NextResponse.json(body, { status })
}

export function badRequest(message = "Solicitud inválida"): NextResponse {
  return jsonError(message, 400, "BAD_REQUEST")
}

export function unauthorized(message = "No autorizado"): NextResponse {
  return jsonError(message, 401, "UNAUTHORIZED")
}

export function forbidden(message = "Acceso denegado"): NextResponse {
  return jsonError(message, 403, "FORBIDDEN")
}

export function notFound(message = "Recurso no encontrado"): NextResponse {
  return jsonError(message, 404, "NOT_FOUND")
}
