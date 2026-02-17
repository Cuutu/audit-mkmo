import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { requireObjectId } from "@/lib/validators"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const idErr = requireObjectId(params.id)
    if (idErr) return idErr

    const body = await request.json().catch(() => ({}))
    const { procesoNumero, nombre, items, activo } = body

    const plantillaAnterior = await prisma.checklistTemplate.findUnique({
      where: { id: params.id },
    })

    if (!plantillaAnterior) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (procesoNumero !== undefined) {
      if (procesoNumero < 1 || procesoNumero > 8) {
        return NextResponse.json(
          { error: "El número de proceso debe estar entre 1 y 8" },
          { status: 400 }
        )
      }
      updateData.procesoNumero = parseInt(procesoNumero)
    }
    if (nombre !== undefined) updateData.nombre = nombre
    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return NextResponse.json(
          { error: "Items debe ser un array" },
          { status: 400 }
        )
      }
      updateData.items = items
    }
    if (activo !== undefined) updateData.activo = activo

    const plantilla = await prisma.checklistTemplate.update({
      where: { id: params.id },
      data: updateData,
    })

    await createAuditLog({
      accion: "UPDATE",
      entidad: "ChecklistTemplate",
      entidadId: plantilla.id,
      userId: session.user.id,
      valorAnterior: JSON.stringify(plantillaAnterior),
      valorNuevo: JSON.stringify(plantilla),
    })

    return NextResponse.json(plantilla)
  } catch (error) {
    console.error("Error al actualizar plantilla:", error)
    return NextResponse.json(
      { error: "Error al actualizar plantilla" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const idErr = requireObjectId(params.id)
    if (idErr) return idErr

    const plantilla = await prisma.checklistTemplate.findUnique({
      where: { id: params.id },
    })

    if (!plantilla) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      )
    }

    await prisma.checklistTemplate.delete({
      where: { id: params.id },
    })

    await createAuditLog({
      accion: "DELETE",
      entidad: "ChecklistTemplate",
      entidadId: plantilla.id,
      userId: session.user.id,
      valorAnterior: JSON.stringify(plantilla),
    })

    return NextResponse.json({ message: "Plantilla eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar plantilla:", error)
    return NextResponse.json(
      { error: "Error al eliminar plantilla" },
      { status: 500 }
    )
  }
}

