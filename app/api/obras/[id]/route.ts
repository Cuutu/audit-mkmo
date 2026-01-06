import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const obra = await prisma.obra.findUnique({
      where: { id: params.id, deleted: false },
      include: {
        procesos: {
          orderBy: { numero: "asc" },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    if (!obra) {
      return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 })
    }

    return NextResponse.json(obra)
  } catch (error) {
    console.error("Error al obtener obra:", error)
    return NextResponse.json(
      { error: "Error al obtener obra" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { numero, nombre, ano, mes, observaciones, estado } = body

    // Obtener obra actual para comparar cambios
    const obraActual = await prisma.obra.findUnique({
      where: { id: params.id, deleted: false },
    })

    if (!obraActual) {
      return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 })
    }

    // Validar que no exista otra obra con el mismo número (si cambió)
    if (numero !== obraActual.numero) {
      const obraExistente = await prisma.obra.findFirst({
        where: {
          numero,
          deleted: false,
          id: { not: params.id },
        },
      })

      if (obraExistente) {
        return NextResponse.json(
          { error: "Ya existe otra obra con ese número" },
          { status: 400 }
        )
      }
    }

    // Actualizar obra
    const obraActualizada = await prisma.obra.update({
      where: { id: params.id },
      data: {
        numero,
        nombre,
        ano: parseInt(ano),
        mes: parseInt(mes),
        observaciones,
        estado: estado as typeof obraActual.estado,
      },
    })

    // Registrar cambios en audit log
    const cambios: string[] = []
    if (obraActual.numero !== numero) cambios.push(`Número: ${obraActual.numero} → ${numero}`)
    if (obraActual.nombre !== nombre) cambios.push(`Nombre: ${obraActual.nombre} → ${nombre}`)
    if (obraActual.ano !== parseInt(ano)) cambios.push(`Año: ${obraActual.ano} → ${ano}`)
    if (obraActual.mes !== parseInt(mes)) cambios.push(`Mes: ${obraActual.mes} → ${mes}`)
    if (obraActual.estado !== estado) cambios.push(`Estado: ${obraActual.estado} → ${estado}`)
    if (obraActual.observaciones !== observaciones) cambios.push("Observaciones modificadas")

    if (cambios.length > 0) {
      await createAuditLog({
        accion: "UPDATE",
        entidad: "Obra",
        entidadId: obraActualizada.id,
        userId: session.user.id,
        obraId: obraActualizada.id,
        campo: "datos_generales",
        valorAnterior: JSON.stringify(obraActual),
        valorNuevo: JSON.stringify(obraActualizada),
      })
    }

    return NextResponse.json(obraActualizada)
  } catch (error) {
    console.error("Error al actualizar obra:", error)
    return NextResponse.json(
      { error: "Error al actualizar obra" },
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
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin puede eliminar
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo los administradores pueden eliminar obras" },
        { status: 403 }
      )
    }

    const obra = await prisma.obra.findUnique({
      where: { id: params.id, deleted: false },
    })

    if (!obra) {
      return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 })
    }

    // Borrado lógico
    await prisma.obra.update({
      where: { id: params.id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    })

    await createAuditLog({
      accion: "DELETE",
      entidad: "Obra",
      entidadId: obra.id,
      userId: session.user.id,
      obraId: obra.id,
      valorAnterior: JSON.stringify(obra),
    })

    return NextResponse.json({ message: "Obra eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar obra:", error)
    return NextResponse.json(
      { error: "Error al eliminar obra" },
      { status: 500 }
    )
  }
}

