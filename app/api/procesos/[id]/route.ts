import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProcesoEstado, ResponsableTipo, Role } from "@prisma/client"

// Función helper para verificar permisos según el rol del usuario y el responsable del proceso
function canModifyProcess(userRole: Role, procesoResponsable: ResponsableTipo): boolean {
  // ADMIN puede modificar todo
  if (userRole === "ADMIN") {
    return true
  }

  // VIEWER no puede modificar nada
  if (userRole === "VIEWER") {
    return false
  }

  // ENGINEER puede modificar procesos con responsable ENGINEER (rojo) y BOTH (amarillo)
  if (userRole === "ENGINEER") {
    return procesoResponsable === "ENGINEER" || procesoResponsable === "BOTH"
  }

  // ACCOUNTANT puede modificar procesos con responsable ACCOUNTANT (verde) y BOTH (amarillo)
  if (userRole === "ACCOUNTANT") {
    return procesoResponsable === "ACCOUNTANT" || procesoResponsable === "BOTH"
  }

  return false
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { estado, avance, observaciones, checklist, datos } = body

    const proceso = await prisma.proceso.findUnique({
      where: { id: params.id },
      include: { obra: true },
    })

    if (!proceso) {
      return NextResponse.json({ error: "Proceso no encontrado" }, { status: 404 })
    }

    // Verificar permisos según el rol del usuario y el responsable del proceso
    if (!canModifyProcess(session.user.role as Role, proceso.responsable)) {
      return NextResponse.json(
        { 
          error: "No tiene permisos para modificar este proceso. Solo puede modificar procesos asignados a su rol o compartidos (BOTH)." 
        },
        { status: 403 }
      )
    }

    const procesoAnterior = { ...proceso }

    // Construir objeto de actualización dinámicamente
    const updateData: any = {}
    if (estado !== undefined) updateData.estado = estado as ProcesoEstado
    if (avance !== undefined) updateData.avance = parseInt(avance)
    if (observaciones !== undefined) updateData.observaciones = observaciones
    if (checklist !== undefined) updateData.checklist = checklist
    if (datos !== undefined) updateData.datos = datos

    const procesoActualizado = await prisma.proceso.update({
      where: { id: params.id },
      data: updateData,
    })

    // Calcular avance general de la obra
    const procesos = await prisma.proceso.findMany({
      where: { obraId: proceso.obraId },
    })
    const avanceGeneral = Math.round(
      procesos.reduce((acc, p) => acc + p.avance, 0) / procesos.length
    )

    await prisma.obra.update({
      where: { id: proceso.obraId },
      data: { avance: avanceGeneral },
    })

    // Determinar qué campo cambió para el audit log
    let campoCambiado = "datos_generales"
    if (estado !== undefined) campoCambiado = "estado"
    else if (avance !== undefined) campoCambiado = "avance"
    else if (observaciones !== undefined) campoCambiado = "observaciones"
    else if (checklist !== undefined) campoCambiado = "checklist"
    else if (datos !== undefined) campoCambiado = "datos"

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Proceso",
        entidadId: proceso.id,
        userId: session.user.id,
        obraId: proceso.obraId,
        procesoId: proceso.id,
        campo: campoCambiado,
        valorAnterior: JSON.stringify(procesoAnterior),
        valorNuevo: JSON.stringify(procesoActualizado),
      },
    })

    return NextResponse.json(procesoActualizado)
  } catch (error) {
    console.error("Error al actualizar proceso:", error)
    return NextResponse.json(
      { error: "Error al actualizar proceso" },
      { status: 500 }
    )
  }
}

