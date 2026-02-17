import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { deleteFile } from "@/lib/file-upload"
import { requireObjectId } from "@/lib/validators"
import { checkArchivoAccess } from "@/lib/permissions"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const idError = requireObjectId(params.id)
    if (idError) return idError

    const { archivo, error: accessError } = await checkArchivoAccess(params.id, session)
    if (accessError) return accessError
    if (!archivo || archivo.deleted) {
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

    const idError = requireObjectId(params.id)
    if (idError) return idError

    const body = await request.json().catch(() => ({}))
    const { action } = body

    if (action === "restore") {
      const { archivo, error: accessError } = await checkArchivoAccess(params.id, session)
      if (accessError) return accessError
      const archivoDeleted = archivo?.deleted ? archivo : null

      if (!archivoDeleted) {
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
        entidadId: archivoDeleted.id,
        userId: session.user.id,
        obraId: archivoDeleted.obraId || undefined,
        procesoId: archivoDeleted.procesoId || undefined,
        archivoId: archivoDeleted.id,
      })

      return NextResponse.json({ message: "Archivo restaurado correctamente" })
    } else if (action === "permanent-delete") {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Solo los administradores pueden eliminar archivos definitivamente" },
          { status: 403 }
        )
      }

      const { archivo: archivoPerm, error: accessErrorPerm } = await checkArchivoAccess(params.id, session)
      if (accessErrorPerm) return accessErrorPerm
      const archivo = archivoPerm?.deleted ? archivoPerm : null

      if (!archivo) {
        return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
      }

      // Eliminar archivo de Vercel Blob
      await deleteFile(archivo.ruta)

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
