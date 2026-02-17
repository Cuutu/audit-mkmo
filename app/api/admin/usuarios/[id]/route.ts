import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
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
    const { email, name, password, role } = body

    const usuarioAnterior = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!usuarioAnterior) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const updateData: any = {
      name: name || usuarioAnterior.name,
      role: (role as Role) || usuarioAnterior.role,
    }

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const usuario = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    await createAuditLog({
      accion: "UPDATE",
      entidad: "User",
      entidadId: usuario.id,
      userId: session.user.id,
      valorAnterior: JSON.stringify(usuarioAnterior),
      valorNuevo: JSON.stringify(usuario),
    })

    return NextResponse.json({
      id: usuario.id,
      email: usuario.email,
      name: usuario.name,
      role: usuario.role,
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
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

    const usuario = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir eliminar al propio usuario
    if (usuario.id === session.user.id) {
      return NextResponse.json(
        { error: "No puede eliminar su propio usuario" },
        { status: 400 }
      )
    }

    // Verificar si tiene obras o procesos asignados
    const obrasCreadas = await prisma.obra.count({
      where: { createdById: params.id },
    })

    const procesosAsignados = await prisma.proceso.count({
      where: { responsableId: params.id },
    })

    if (obrasCreadas > 0 || procesosAsignados > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el usuario porque tiene obras o procesos asignados",
        },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    await createAuditLog({
      accion: "DELETE",
      entidad: "User",
      entidadId: usuario.id,
      userId: session.user.id,
      valorAnterior: JSON.stringify(usuario),
    })

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}

