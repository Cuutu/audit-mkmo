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
    const search = searchParams.get("search")?.trim() || null
    const añoParam = searchParams.get("ano")
    const mesParam = searchParams.get("mes")
    const estado = searchParams.get("estado") || null
    const responsable = searchParams.get("responsable") || null
    const periodo = searchParams.get("periodo") || null
    const tipoObraAuditoria = searchParams.get("tipoObraAuditoria") || null

    const where: any = { deleted: false }

    if (añoParam) {
      const anoNum = parseInt(añoParam, 10)
      if (!Number.isNaN(anoNum)) where.ano = anoNum
    }
    if (mesParam) {
      const mesNum = parseInt(mesParam, 10)
      if (!Number.isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) where.mes = mesNum
    }
    if (estado) where.estado = estado
    if (responsable) {
      where.procesos = { some: { responsable: responsable as ResponsableTipo } }
    }
    if (tipoObraAuditoria) {
      where.tipoObraAuditoria = tipoObraAuditoria as TipoObraAuditoria
    }

    // Condiciones extra que se combinan con AND (búsqueda y/o período 2022-2023)
    const andConditions: Record<string, unknown>[] = []

    // Búsqueda por texto
    if (search) {
      andConditions.push({
        OR: [
          { numero: { contains: search, mode: "insensitive" } },
          { nombre: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    // Filtro período: valor en MongoDB es string "PERIODO_2022_2023" / "PERIODO_2023_2024"
    if (periodo) {
      if (periodo === "PERIODO_2022_2023") {
        // Obras con ese periodo o sin periodo (antiguas)
        andConditions.push({
          OR: [
            { periodo: "PERIODO_2022_2023" },
            { periodo: null },
          ],
        })
      } else {
        where.periodo = periodo
      }
    }

    if (andConditions.length > 0) {
      where = { AND: [where, ...andConditions] }
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
    const periodoValido = ["PERIODO_2022_2023", "PERIODO_2023_2024"].includes(periodo)
    if (!periodoValido) {
      return NextResponse.json(
        { error: "Período inválido o no disponible" },
        { status: 400 }
      )
    }

    // Validar que si el período es 2023-2024, se debe proporcionar tipoObraAuditoria
    if (periodo === "PERIODO_2023_2024" && !tipoObraAuditoria) {
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

