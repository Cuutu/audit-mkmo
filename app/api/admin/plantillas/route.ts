import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const plantillas = await prisma.checklistTemplate.findMany({
      orderBy: [{ procesoNumero: "asc" }, { nombre: "asc" }],
    })

    return NextResponse.json(plantillas)
  } catch (error) {
    console.error("Error al obtener plantillas:", error)
    return NextResponse.json(
      { error: "Error al obtener plantillas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { procesoNumero, nombre, items, activo } = body

    if (!procesoNumero || !nombre || !items) {
      return NextResponse.json(
        { error: "Proceso, nombre e items son requeridos" },
        { status: 400 }
      )
    }

    if (procesoNumero < 1 || procesoNumero > 8) {
      return NextResponse.json(
        { error: "El número de proceso debe estar entre 1 y 8" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items debe ser un array" },
        { status: 400 }
      )
    }

    const plantilla = await prisma.checklistTemplate.create({
      data: {
        procesoNumero: parseInt(procesoNumero),
        nombre,
        items,
        activo: activo !== undefined ? activo : true,
      },
    })

    await createAuditLog({
      accion: "CREATE",
      entidad: "ChecklistTemplate",
      entidadId: plantilla.id,
      userId: session.user.id,
      valorNuevo: JSON.stringify(plantilla),
    })

    return NextResponse.json(plantilla, { status: 201 })
  } catch (error) {
    console.error("Error al crear plantilla:", error)
    return NextResponse.json(
      { error: "Error al crear plantilla" },
      { status: 500 }
    )
  }
}

