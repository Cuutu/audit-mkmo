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

    const body = await request.json().catch(() => ({})).catch(() => ({}))
    const { valor, tipo, descripcion, categoria } = body

    const parametroAnterior = await prisma.parametro.findUnique({
      where: { id: params.id },
    })

    if (!parametroAnterior) {
      return NextResponse.json(
        { error: "Parámetro no encontrado" },
        { status: 404 }
      )
    }

    // Validar tipo si se proporciona
    if (tipo) {
      const tiposValidos = ["string", "number", "boolean", "json"]
      if (!tiposValidos.includes(tipo)) {
        return NextResponse.json(
          { error: "Tipo no válido" },
          { status: 400 }
        )
      }
    }

    // Validar valor según tipo
    const tipoFinal = tipo || parametroAnterior.tipo
    if (valor) {
      if (tipoFinal === "number" && isNaN(Number(valor))) {
        return NextResponse.json(
          { error: "El valor debe ser un número" },
          { status: 400 }
        )
      }

      if (tipoFinal === "boolean" && valor !== "true" && valor !== "false") {
        return NextResponse.json(
          { error: "El valor debe ser 'true' o 'false'" },
          { status: 400 }
        )
      }

      if (tipoFinal === "json") {
        try {
          JSON.parse(valor)
        } catch {
          return NextResponse.json(
            { error: "El valor debe ser un JSON válido" },
            { status: 400 }
          )
        }
      }
    }

    const parametro = await prisma.parametro.update({
      where: { id: params.id },
      data: {
        valor: valor || parametroAnterior.valor,
        tipo: tipo || parametroAnterior.tipo,
        descripcion: descripcion !== undefined ? descripcion : parametroAnterior.descripcion,
        categoria: categoria !== undefined ? categoria : parametroAnterior.categoria,
      },
    })

    await createAuditLog({
      accion: "UPDATE",
      entidad: "Parametro",
      entidadId: parametro.id,
      userId: session.user.id,
      valorAnterior: JSON.stringify(parametroAnterior),
      valorNuevo: JSON.stringify(parametro),
    })

    return NextResponse.json(parametro)
  } catch (error) {
    console.error("Error al actualizar parámetro:", error)
    return NextResponse.json(
      { error: "Error al actualizar parámetro" },
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

    const parametro = await prisma.parametro.findUnique({
      where: { id: params.id },
    })

    if (!parametro) {
      return NextResponse.json(
        { error: "Parámetro no encontrado" },
        { status: 404 }
      )
    }

    await prisma.parametro.delete({
      where: { id: params.id },
    })

    await createAuditLog({
      accion: "DELETE",
      entidad: "Parametro",
      entidadId: parametro.id,
      userId: session.user.id,
      valorAnterior: JSON.stringify(parametro),
    })

    return NextResponse.json({ message: "Parámetro eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar parámetro:", error)
    return NextResponse.json(
      { error: "Error al eliminar parámetro" },
      { status: 500 }
    )
  }
}

