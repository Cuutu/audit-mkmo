import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PapeleraClient } from "@/components/papelera/papelera-client"

export default async function PapeleraPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const archivosEliminados = await prisma.archivo.findMany({
    where: { deleted: true },
    include: {
      obra: {
        select: { numero: true, nombre: true },
      },
      proceso: {
        select: { numero: true, nombre: true },
      },
      subidoPor: {
        select: { name: true },
      },
    },
    orderBy: { deletedAt: "desc" },
  })

  // Obtener información de deletedBy por separado si existe
  const archivosConDeletedBy = await Promise.all(
    archivosEliminados.map(async (archivo) => {
      if (archivo.deletedById) {
        const deletedByUser = await prisma.user.findUnique({
          where: { id: archivo.deletedById },
          select: { name: true },
        })
        return {
          ...archivo,
          deletedBy: deletedByUser,
        }
      }
      return {
        ...archivo,
        deletedBy: null,
      }
    })
  )

  return <PapeleraClient archivos={archivosConDeletedBy} userRole={session.user.role} />
}

