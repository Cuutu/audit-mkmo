import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ParametrosClient } from "@/components/admin/parametros-client"

export default async function ParametrosPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const parametros = await prisma.parametro.findMany({
    orderBy: [{ categoria: "asc" }, { clave: "asc" }],
  })

  return <ParametrosClient parametros={parametros} />
}

