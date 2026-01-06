import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

export async function GET(
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
      include: {
        obra: {
          select: { id: true, numero: true },
        },
      },
    })

    if (!archivo) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    // Verificar que el archivo existe en el sistema de archivos
    if (!existsSync(archivo.ruta)) {
      return NextResponse.json(
        { error: "El archivo no existe en el servidor" },
        { status: 404 }
      )
    }

    // Leer el archivo
    const fileBuffer = await readFile(archivo.ruta)

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

    // Retornar el archivo
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": archivo.tipo,
        "Content-Disposition": `attachment; filename="${archivo.nombreOriginal}"`,
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

