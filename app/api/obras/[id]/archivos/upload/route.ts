import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveFile, isAllowedFileType } from "@/lib/file-upload"
import { createAuditLog } from "@/lib/audit"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const procesoId = formData.get("procesoId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    if (!isAllowedFileType(file.name)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      )
    }

    // Verificar que la obra existe
    const obra = await prisma.obra.findUnique({
      where: { id: params.id, deleted: false },
    })

    if (!obra) {
      return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 })
    }

    // Verificar proceso si se especificó
    if (procesoId) {
      const proceso = await prisma.proceso.findFirst({
        where: {
          id: procesoId,
          obraId: params.id,
        },
      })

      if (!proceso) {
        return NextResponse.json(
          { error: "Proceso no encontrado" },
          { status: 404 }
        )
      }
    }

    // Buscar archivo existente con el mismo nombre
    const archivoExistente = await prisma.archivo.findFirst({
      where: {
        obraId: params.id,
        procesoId: procesoId || null,
        nombreOriginal: file.name,
        deleted: false,
      },
      orderBy: { version: "desc" },
    })

    const nuevaVersion = archivoExistente ? archivoExistente.version + 1 : 1

    // Guardar archivo
    const fileData = await saveFile(file, params.id, procesoId || undefined)

    // Crear registro en BD
    const archivo = await prisma.archivo.create({
      data: {
        nombre: fileData.nombre,
        nombreOriginal: file.name,
        tipo: fileData.tipo,
        tamano: fileData.tamano,
        ruta: fileData.ruta,
        version: nuevaVersion,
        archivoAnteriorId: archivoExistente?.id || null,
        obraId: params.id,
        procesoId: procesoId || null,
        subidoPorId: session.user.id,
      },
    })

    // Registrar en audit log
    await createAuditLog({
      accion: "UPLOAD",
      entidad: "Archivo",
      entidadId: archivo.id,
      userId: session.user.id,
      obraId: params.id,
      procesoId: procesoId || undefined,
      archivoId: archivo.id,
      valorNuevo: { nombre: file.name, version: nuevaVersion },
    })

    return NextResponse.json(archivo, { status: 201 })
  } catch (error: any) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json(
      { error: error.message || "Error al subir archivo" },
      { status: 500 }
    )
  }
}

