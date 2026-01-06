import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { validatePasswordResetToken, markTokenAsUsed } from "@/lib/password-reset"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const validation = await validatePasswordResetToken(token)

    if (!validation.valid || !validation.userId) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: validation.userId },
      data: { password: hashedPassword },
    })

    // Marcar token como usado
    await markTokenAsUsed(token)

    return NextResponse.json({
      message: "Contraseña restablecida correctamente",
    })
  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    return NextResponse.json(
      { error: "Error al restablecer contraseña" },
      { status: 500 }
    )
  }
}

