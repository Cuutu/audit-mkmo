import { put, del } from "@vercel/blob"

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "524288000") // 500MB por defecto (máximo de Vercel Blob)

export async function saveFile(
  file: File,
  obraId: string,
  procesoId?: string
): Promise<{ url: string; nombre: string; tamano: number; tipo: string }> {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Generar nombre único con estructura de carpetas
  const timestamp = Date.now()
  const carpeta = procesoId ? `obras/${obraId}/proceso-${procesoId}` : `obras/${obraId}`
  const nombreArchivo = `${carpeta}/${timestamp}-${file.name}`

  // Subir a Vercel Blob
  const blob = await put(nombreArchivo, file, {
    access: "public",
  })

  return {
    url: blob.url,
    nombre: `${timestamp}-${file.name}`,
    tamano: file.size,
    tipo: file.type,
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error("Error al eliminar archivo de Vercel Blob:", error)
    // No lanzamos error para que no falle el proceso de eliminación
  }
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export function isAllowedFileType(filename: string): boolean {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
  ]
  const extension = getFileExtension(filename)
  return allowedTypes.includes(extension)
}
