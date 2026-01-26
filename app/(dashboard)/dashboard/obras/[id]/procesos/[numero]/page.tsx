import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProcesoDetalleClient } from "@/components/procesos/proceso-detalle-client"

export default async function ProcesoDetallePage({
  params,
}: {
  params: { id: string; numero: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    notFound()
  }

  const numeroProceso = parseInt(params.numero)

  const obra = await prisma.obra.findUnique({
    where: { id: params.id, deleted: false },
  })

  if (!obra) {
    notFound()
  }

  const proceso = await prisma.proceso.findFirst({
    where: {
      obraId: params.id,
      numero: numeroProceso,
    },
    include: {
      responsableUser: {
        select: { name: true, email: true },
      },
      archivos: {
        where: { deleted: false },
        include: {
          subidoPor: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!proceso) {
    notFound()
  }

  return <ProcesoDetalleClient obra={obra} proceso={proceso} userRole={session.user.role} />
}

