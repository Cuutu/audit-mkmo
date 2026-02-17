/**
 * Helpers de permisos para verificar acceso a recursos.
 * Evita IDOR: usuario solo accede a archivos de obras que puede ver.
 */

import { prisma } from "./prisma"
import { Session } from "next-auth"
import { NextResponse } from "next/server"
import { forbidden, notFound } from "./api-response"

/**
 * Verifica si el usuario tiene acceso a un archivo (vía su obra).
 * En este sistema: usuarios autenticados ven obras no eliminadas.
 * Verificamos que la obra exista y no esté eliminada.
 */
export async function checkArchivoAccess(
  archivoId: string,
  _session: Session
): Promise<{ archivo: Awaited<ReturnType<typeof prisma.archivo.findUnique>>; error: NextResponse | null }> {
  const archivo = await prisma.archivo.findUnique({
    where: { id: archivoId },
    include: {
      obra: { select: { id: true, deleted: true } },
    },
  })

  if (!archivo) {
    return { archivo: null, error: notFound("Archivo no encontrado") }
  }

  if (archivo.obraId && archivo.obra?.deleted) {
    return { archivo: null, error: forbidden("Obra no disponible") }
  }

  return { archivo, error: null }
}
