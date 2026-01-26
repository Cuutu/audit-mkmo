import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveFile, isAllowedFileType } from "@/lib/file-upload"
import { createAuditLog } from "@/lib/audit"
import { ResponsableTipo, Role } from "@prisma/client"

// Configurar tiempo máximo para archivos grandes (300 segundos = 5 minutos)
export const maxDuration = 300

// Función helper para verificar permisos según el rol del usuario y el responsable del proceso
function canModifyProcess(userRole: Role, procesoResponsable: ResponsableTipo): boolean {
  // ADMIN puede modificar todo
  if (userRole === "ADMIN") {
    return true
  }

  // VIEWER no puede modificar nada
  if (userRole === "VIEWER") {
    return false
  }

  // ENGINEER puede modificar procesos con responsable ENGINEER (rojo) y BOTH (amarillo)
  if (userRole === "ENGINEER") {
    return procesoResponsable === "ENGINEER" || procesoResponsable === "BOTH"
  }

  // ACCOUNTANT puede modificar procesos con responsable ACCOUNTANT (verde) y BOTH (amarillo)
  if (userRole === "ACCOUNTANT") {
    return procesoResponsable === "ACCOUNTANT" || procesoResponsable === "BOTH"
  }

  return false
}

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

      // Verificar permisos para subir archivos a este proceso
      if (!canModifyProcess(session.user.role as Role, proceso.responsable)) {
        return NextResponse.json(
          { 
            error: "No tiene permisos para subir archivos a este proceso. Solo puede subir archivos a procesos asignados a su rol o compartidos (BOTH)." 
          },
          { status: 403 }
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

    // Guardar archivo en Vercel Blob
    const fileData = await saveFile(file, params.id, procesoId || undefined)

    // Crear registro en BD
    const archivo = await prisma.archivo.create({
      data: {
        nombre: fileData.nombre,
        nombreOriginal: file.name,
        tipo: fileData.tipo,
        tamano: fileData.tamano,
        ruta: fileData.url, // Ahora guardamos la URL del blob
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
