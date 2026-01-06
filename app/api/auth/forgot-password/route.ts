import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/password-reset"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Por seguridad, siempre devolvemos éxito aunque el email no exista
    if (!user) {
      return NextResponse.json({
        message: "Si el email existe, recibirá instrucciones para recuperar su contraseña.",
      })
    }

    const token = await generatePasswordResetToken(user.id)

    // En producción, aquí enviarías el email con el token
    // Por ahora, en desarrollo, puedes loguear el token o usar un servicio de email
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`

    // TODO: Integrar servicio de email (Resend, SendGrid, etc.)
    // await sendPasswordResetEmail(user.email, resetUrl)

    // En desarrollo, loguear el URL (remover en producción)
    if (process.env.NODE_ENV === "development") {
      console.log("🔗 Password Reset URL:", resetUrl)
    }

    return NextResponse.json({
      message: "Si el email existe, recibirá instrucciones para recuperar su contraseña.",
      // En desarrollo, incluir el token para testing
      ...(process.env.NODE_ENV === "development" && { token, resetUrl }),
    })
  } catch (error) {
    console.error("Error al procesar recuperación de contraseña:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

