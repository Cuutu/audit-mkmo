import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditarObraClient } from "@/components/obras/editar-obra-client"

export default async function EditarObraPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const obra = await prisma.obra.findUnique({
    where: { id: params.id, deleted: false },
  })

  if (!obra) {
    notFound()
  }

  return <EditarObraClient obra={obra} />
}

