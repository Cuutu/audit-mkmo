import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResponsableTipo, PeriodoAuditoria, TipoObraAuditoria } from "@prisma/client"
import { getProcesosParaObra, PeriodoId, TipoObraAuditoriaId } from "@/lib/periodos-config"

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
    const periodo = searchParams.get("periodo")
    const tipoObraAuditoria = searchParams.get("tipoObraAuditoria")

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

    if (periodo) {
      where.periodo = periodo
    }

    if (tipoObraAuditoria) {
      where.tipoObraAuditoria = tipoObraAuditoria
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
              numero: true,
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
    const { numero, nombre, ano, mes, observaciones, estado, periodo, tipoObraAuditoria } = body

    // Validar período
    const periodoValido = ["PERIODO_2022_2023", "PERIODO_2023_2024", "PERIODO_2024_2025"].includes(periodo)
    if (!periodoValido) {
      return NextResponse.json(
        { error: "Período inválido" },
        { status: 400 }
      )
    }

    // Validar que si el período no es 2022-2023, se debe proporcionar tipoObraAuditoria
    if (periodo !== "PERIODO_2022_2023" && !tipoObraAuditoria) {
      return NextResponse.json(
        { error: "El tipo de obra es requerido para el período seleccionado" },
        { status: 400 }
      )
    }

    // Validar tipoObraAuditoria
    if (tipoObraAuditoria && !["TERMINADA", "EN_EJECUCION"].includes(tipoObraAuditoria)) {
      return NextResponse.json(
        { error: "Tipo de obra inválido" },
        { status: 400 }
      )
    }

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
        periodo: periodo as PeriodoAuditoria,
        tipoObraAuditoria: tipoObraAuditoria ? (tipoObraAuditoria as TipoObraAuditoria) : null,
        createdById: session.user.id,
      },
    })

    // Obtener los procesos según el período y tipo de obra
    const procesosData = getProcesosParaObra(
      periodo as PeriodoId,
      tipoObraAuditoria as TipoObraAuditoriaId | undefined
    )

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

