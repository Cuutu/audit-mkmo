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

    const parametros = await prisma.parametro.findMany({
      orderBy: [{ categoria: "asc" }, { clave: "asc" }],
      take: 200,
    })

    return NextResponse.json(parametros)
  } catch (error) {
    console.error("Error al obtener parámetros:", error)
    return NextResponse.json(
      { error: "Error al obtener parámetros" },
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
    const { clave, valor, tipo, descripcion, categoria } = body

    if (!clave || !valor || !tipo) {
      return NextResponse.json(
        { error: "Clave, valor y tipo son requeridos" },
        { status: 400 }
      )
    }

    // Validar tipo
    const tiposValidos = ["string", "number", "boolean", "json"]
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo no válido" },
        { status: 400 }
      )
    }

    // Validar valor según tipo
    if (tipo === "number" && isNaN(Number(valor))) {
      return NextResponse.json(
        { error: "El valor debe ser un número" },
        { status: 400 }
      )
    }

    if (tipo === "boolean" && valor !== "true" && valor !== "false") {
      return NextResponse.json(
        { error: "El valor debe ser 'true' o 'false'" },
        { status: 400 }
      )
    }

    if (tipo === "json") {
      try {
        JSON.parse(valor)
      } catch {
        return NextResponse.json(
          { error: "El valor debe ser un JSON válido" },
          { status: 400 }
        )
      }
    }

    const parametro = await prisma.parametro.create({
      data: {
        clave,
        valor,
        tipo,
        descripcion: descripcion || null,
        categoria: categoria || null,
      },
    })

    await createAuditLog({
      accion: "CREATE",
      entidad: "Parametro",
      entidadId: parametro.id,
      userId: session.user.id,
      valorNuevo: JSON.stringify(parametro),
    })

    return NextResponse.json(parametro, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "La clave ya existe" },
        { status: 400 }
      )
    }
    console.error("Error al crear parámetro:", error)
    return NextResponse.json(
      { error: "Error al crear parámetro" },
      { status: 500 }
    )
  }
}

