import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResponsableTipo } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const año = searchParams.get("ano")
    const mes = searchParams.get("mes")
    const estado = searchParams.get("estado")
    const responsable = searchParams.get("responsable")

    const where: any = {
      deleted: false,
    }

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" } },
        { nombre: { contains: search, mode: "insensitive" } },
      ]
    }

    if (año) {
      where.ano = parseInt(año)
    }

    if (mes) {
      where.mes = parseInt(mes)
    }

    if (estado) {
      where.estado = estado
    }

    if (responsable) {
      where.procesos = {
        some: {
          responsable: responsable as any,
        },
      }
    }

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [obras, total] = await Promise.all([
      prisma.obra.findMany({
        where,
        include: {
          procesos: {
            select: {
              estado: true,
              responsable: true,
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.obra.count({ where }),
    ])

    return NextResponse.json({ obras, total })
  } catch (error) {
    console.error("Error al obtener obras:", error)
    return NextResponse.json(
      { error: "Error al obtener obras" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { numero, nombre, ano, mes, observaciones, estado } = body

    // Validar que no exista otra obra con el mismo número
    const obraExistente = await prisma.obra.findFirst({
      where: {
        numero,
        deleted: false,
      },
    })

    if (obraExistente) {
      return NextResponse.json(
        { error: "Ya existe una obra con ese número" },
        { status: 400 }
      )
    }

    const obra = await prisma.obra.create({
      data: {
        numero,
        nombre,
        ano: parseInt(ano),
        mes: parseInt(mes),
        observaciones,
        estado: estado || "NO_INICIADA",
        createdById: session.user.id,
      },
    })

    // Crear los 8 procesos iniciales
    const procesosData = [
      { numero: 1, nombre: "Definición técnica de la obra", responsable: "ENGINEER" },
      { numero: 2, nombre: "Proyecto / costo proyectado / cronograma", responsable: "ENGINEER" },
      { numero: 3, nombre: "Constatación (planos / revisiones / registro fotográfico)", responsable: "ENGINEER" },
      { numero: 4, nombre: "Método de redeterminación / desglose económico", responsable: "ACCOUNTANT" },
      { numero: 5, nombre: "Materiales involucrados", responsable: "BOTH" },
      { numero: 6, nombre: "Mano de obra involucrada", responsable: "ACCOUNTANT" },
      { numero: 7, nombre: "Creación de base de datos", responsable: "BOTH" },
      { numero: 8, nombre: "Análisis de resultados", responsable: "BOTH" },
    ]

    await prisma.proceso.createMany({
      data: procesosData.map((p) => ({
        obraId: obra.id,
        numero: p.numero,
        nombre: p.nombre,
        responsable: p.responsable as ResponsableTipo,
      })),
    })

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Obra",
        entidadId: obra.id,
        userId: session.user.id,
        obraId: obra.id,
        valorNuevo: JSON.stringify(obra),
      },
    })

    return NextResponse.json(obra, { status: 201 })
  } catch (error) {
    console.error("Error al crear obra:", error)
    return NextResponse.json(
      { error: "Error al crear obra" },
      { status: 500 }
    )
  }
}

