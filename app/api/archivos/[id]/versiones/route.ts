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

    const archivoActual = await prisma.archivo.findUnique({
      where: { id: params.id },
    })

    if (!archivoActual) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    // Obtener todas las versiones (actual + anteriores)
    const versiones: any[] = [archivoActual]

    // Buscar versiones anteriores recursivamente
    let archivoAnteriorId = archivoActual.archivoAnteriorId
    while (archivoAnteriorId) {
      const archivoAnterior = await prisma.archivo.findUnique({
        where: { id: archivoAnteriorId },
      })
      if (archivoAnterior) {
        versiones.push(archivoAnterior)
        archivoAnteriorId = archivoAnterior.archivoAnteriorId
      } else {
        break
      }
    }

    // Ordenar por versión descendente (más reciente primero)
    versiones.sort((a, b) => b.version - a.version)

    return NextResponse.json(versiones)
  } catch (error) {
    console.error("Error al obtener versiones:", error)
    return NextResponse.json(
      { error: "Error al obtener versiones" },
      { status: 500 }
    )
  }
}

