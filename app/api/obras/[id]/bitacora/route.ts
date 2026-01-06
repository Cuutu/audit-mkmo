import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        obraId: params.id,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error al obtener bitácora:", error)
    return NextResponse.json(
      { error: "Error al obtener bitácora" },
      { status: 500 }
    )
  }
}

