import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireObjectId, safeContentDispositionFilename } from "@/lib/validators"
import { checkArchivoAccess } from "@/lib/permissions"

export async function GET(
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

    // Registrar descarga en audit log
    await prisma.auditLog.create({
      data: {
        accion: "DOWNLOAD",
        entidad: "Archivo",
        entidadId: archivo.id,
        userId: session.user.id,
        obraId: archivo.obraId || undefined,
        procesoId: archivo.procesoId || undefined,
        archivoId: archivo.id,
      },
    })

    // Descargar el archivo desde Vercel Blob
    const response = await fetch(archivo.ruta)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "El archivo no existe en el servidor" },
        { status: 404 }
      )
    }

    const fileBuffer = await response.arrayBuffer()

    const safeFilename = safeContentDispositionFilename(archivo.nombreOriginal)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": archivo.tipo,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": archivo.tamano.toString(),
      },
    })
  } catch (error) {
    console.error("Error al descargar archivo:", error)
    return NextResponse.json(
      { error: "Error al descargar archivo" },
      { status: 500 }
    )
  }
}
