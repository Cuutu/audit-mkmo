import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PlantillasClient } from "@/components/admin/plantillas-client"

export default async function PlantillasPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const plantillas = await prisma.checklistTemplate.findMany({
    orderBy: [{ procesoNumero: "asc" }, { nombre: "asc" }],
  })

  return <PlantillasClient plantillas={plantillas} />
}

