import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760") // 10MB por defecto

export async function saveFile(
  file: File,
  obraId: string,
  procesoId?: string
): Promise<{ ruta: string; nombre: string; tamano: number; tipo: string }> {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE} bytes`)
  }

  // Crear estructura de carpetas
  const obraDir = join(UPLOAD_DIR, obraId)
  const procesoDir = procesoId ? join(obraDir, `proceso-${procesoId}`) : obraDir

  if (!existsSync(procesoDir)) {
    await mkdir(procesoDir, { recursive: true })
  }

  // Generar nombre único
  const timestamp = Date.now()
  const nombreArchivo = `${timestamp}-${file.name}`
  const rutaCompleta = join(procesoDir, nombreArchivo)

  // Guardar archivo
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(rutaCompleta, buffer)

  return {
    ruta: rutaCompleta,
    nombre: nombreArchivo,
    tamano: file.size,
    tipo: file.type,
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

