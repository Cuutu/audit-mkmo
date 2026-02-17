import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/password-reset"
import { checkRateLimit } from "@/lib/rate-limit"

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, "forgot-password")
    if (!rl.success) {
      return rl.response
    }

    const body = await request.json().catch(() => ({}))
    const { email } = body

    if (!email || typeof email !== "string") {
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

    // TODO: Integrar servicio de email. En desarrollo, el URL se puede obtener de logs del servidor
    // NUNCA exponer token/resetUrl en la response (riesgo de fuga en proxies, analytics, etc.)
    return NextResponse.json({
      message: "Si el email existe, recibirá instrucciones para recuperar su contraseña.",
    })
  } catch (error) {
    console.error("Error al procesar recuperación de contraseña:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

