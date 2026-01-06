import { prisma } from "./prisma"
import { AuditAction } from "@prisma/client"

interface CreateAuditLogParams {
  accion: AuditAction
  entidad: string
  entidadId: string
  userId: string
  obraId?: string
  procesoId?: string
  archivoId?: string
  campo?: string
  valorAnterior?: any
  valorNuevo?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId,
        userId: params.userId,
        obraId: params.obraId,
        procesoId: params.procesoId,
        archivoId: params.archivoId,
        campo: params.campo,
        valorAnterior: params.valorAnterior
          ? JSON.stringify(params.valorAnterior)
          : null,
        valorNuevo: params.valorNuevo ? JSON.stringify(params.valorNuevo) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error("Error al crear audit log:", error)
    // No lanzar error para no interrumpir el flujo principal
  }
}

export async function createActividadLog(
  userId: string,
  accion: string,
  detalle?: string,
  obraId?: string,
  procesoId?: string
) {
  try {
    await prisma.actividadLog.create({
      data: {
        userId,
        accion,
        detalle,
        obraId,
        procesoId,
      },
    })
  } catch (error) {
    console.error("Error al crear actividad log:", error)
  }
}

