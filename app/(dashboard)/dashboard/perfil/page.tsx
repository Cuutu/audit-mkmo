import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PerfilClient } from "@/components/perfil/perfil-client"

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect("/login")
  }

  // Crear objeto sin password para pasar al componente
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    fotoPerfil: user.fotoPerfil,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  const actividadLogs = await prisma.actividadLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return <PerfilClient user={userWithoutPassword} actividadLogs={actividadLogs} />
}

