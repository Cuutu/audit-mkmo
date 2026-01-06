import crypto from "crypto"
import { prisma } from "./prisma"

export async function generatePasswordResetToken(userId: string): Promise<string> {
  // Eliminar tokens anteriores del usuario
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  })

  // Generar nuevo token
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Válido por 1 hora

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

export async function validatePasswordResetToken(
  token: string
): Promise<{ valid: boolean; userId?: string }> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken) {
    return { valid: false }
  }

  if (resetToken.used) {
    return { valid: false }
  }

  if (resetToken.expiresAt < new Date()) {
    return { valid: false }
  }

  return { valid: true, userId: resetToken.userId }
}

export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  })
}

