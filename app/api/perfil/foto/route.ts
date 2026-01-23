import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put, del } from "@vercel/blob"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP)" },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      )
    }

    // Obtener foto anterior para eliminarla después
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { fotoPerfil: true },
    })

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const fileName = `perfiles/${session.user.id}-${timestamp}.${extension}`

    // Subir a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    // Eliminar foto anterior si existe
    if (user?.fotoPerfil && user.fotoPerfil.startsWith("http")) {
      try {
        await del(user.fotoPerfil)
      } catch (error) {
        console.error("Error al eliminar foto anterior:", error)
        // No fallar si no se puede eliminar la foto anterior
      }
    }

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { fotoPerfil: blob.url },
      select: { id: true, fotoPerfil: true },
    })

    return NextResponse.json({
      success: true,
      fotoPerfil: updatedUser.fotoPerfil,
    })
  } catch (error) {
    console.error("Error al subir foto de perfil:", error)
    return NextResponse.json(
      { error: "Error al subir foto de perfil" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener foto actual del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { fotoPerfil: true },
    })

    // Eliminar foto de Vercel Blob si existe
    if (user?.fotoPerfil && user.fotoPerfil.startsWith("http")) {
      try {
        await del(user.fotoPerfil)
      } catch (error) {
        console.error("Error al eliminar foto de Vercel Blob:", error)
        // Continuar aunque falle la eliminación del blob
      }
    }

    // Eliminar foto de perfil del usuario en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: { fotoPerfil: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar foto de perfil:", error)
    return NextResponse.json(
      { error: "Error al eliminar foto de perfil" },
      { status: 500 }
    )
  }
}
