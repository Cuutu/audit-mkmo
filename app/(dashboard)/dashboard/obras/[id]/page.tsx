import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ObraDetalleClient } from "@/components/obras/obra-detalle-client"

export default async function ObraDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    notFound()
  }

  const obra = await prisma.obra.findUnique({
    where: { id: params.id, deleted: false },
    include: {
      procesos: {
        orderBy: { numero: "asc" },
        include: {
          responsableUser: {
            select: { name: true },
          },
        },
      },
      createdBy: {
        select: { name: true, email: true },
      },
    },
  })

  if (!obra) {
    notFound()
  }

  return <ObraDetalleClient obra={obra} />
}

