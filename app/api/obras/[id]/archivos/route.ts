import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireObjectId } from "@/lib/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const idErr = requireObjectId(params.id)
    if (idErr) return idErr

    const archivos = await prisma.archivo.findMany({
      where: {
        obraId: params.id,
        deleted: false,
      },
      take: 500,
      include: {
        subidoPor: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(archivos)
  } catch (error) {
    console.error("Error al obtener archivos:", error)
    return NextResponse.json(
      { error: "Error al obtener archivos" },
      { status: 500 }
    )
  }
}

