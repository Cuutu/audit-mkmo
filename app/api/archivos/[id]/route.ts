import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { unlink } from "fs/promises"
import { existsSync } from "fs"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const archivo = await prisma.archivo.findUnique({
      where: { id: params.id, deleted: false },
    })

    if (!archivo) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    // Borrado lógico
    await prisma.archivo.update({
      where: { id: params.id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    })

    await createAuditLog({
      accion: "DELETE",
      entidad: "Archivo",
      entidadId: archivo.id,
      userId: session.user.id,
      obraId: archivo.obraId || undefined,
      procesoId: archivo.procesoId || undefined,
      archivoId: archivo.id,
      valorAnterior: JSON.stringify(archivo),
    })

    return NextResponse.json({ message: "Archivo eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar archivo:", error)
    return NextResponse.json(
      { error: "Error al eliminar archivo" },
      { status: 500 }
    )
  }
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
    const { action } = body

    if (action === "restore") {
      // Restaurar archivo
      const archivo = await prisma.archivo.findUnique({
        where: { id: params.id, deleted: true },
      })

      if (!archivo) {
        return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
      }

      await prisma.archivo.update({
        where: { id: params.id },
        data: {
          deleted: false,
          deletedAt: null,
          deletedById: null,
        },
      })

      await createAuditLog({
        accion: "RESTORE",
        entidad: "Archivo",
        entidadId: archivo.id,
        userId: session.user.id,
        obraId: archivo.obraId || undefined,
        procesoId: archivo.procesoId || undefined,
        archivoId: archivo.id,
      })

      return NextResponse.json({ message: "Archivo restaurado correctamente" })
    } else if (action === "permanent-delete") {
      // Eliminar definitivamente (solo Admin)
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Solo los administradores pueden eliminar archivos definitivamente" },
          { status: 403 }
        )
      }

      const archivo = await prisma.archivo.findUnique({
        where: { id: params.id, deleted: true },
      })

      if (!archivo) {
        return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
      }

      // Eliminar archivo físico si existe
      if (existsSync(archivo.ruta)) {
        try {
          await unlink(archivo.ruta)
        } catch (error) {
          console.error("Error al eliminar archivo físico:", error)
        }
      }

      // Eliminar de la base de datos
      await prisma.archivo.delete({
        where: { id: params.id },
      })

      await createAuditLog({
        accion: "DELETE",
        entidad: "Archivo",
        entidadId: archivo.id,
        userId: session.user.id,
        obraId: archivo.obraId || undefined,
        procesoId: archivo.procesoId || undefined,
        archivoId: archivo.id,
        valorAnterior: JSON.stringify({ ...archivo, eliminadoDefinitivamente: true }),
      })

      return NextResponse.json({ message: "Archivo eliminado definitivamente" })
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error al procesar archivo:", error)
    return NextResponse.json(
      { error: "Error al procesar archivo" },
      { status: 500 }
    )
  }
}

