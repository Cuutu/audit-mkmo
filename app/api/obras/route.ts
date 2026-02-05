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

    // Construir condiciones base
    const baseConditions: any = { deleted: false }

    if (añoParam) {
      const anoNum = parseInt(añoParam, 10)
      if (!Number.isNaN(anoNum)) baseConditions.ano = anoNum
    }
    if (mesParam) {
      const mesNum = parseInt(mesParam, 10)
      if (!Number.isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) baseConditions.mes = mesNum
    }
    if (estado) baseConditions.estado = estado
    if (responsable) {
      baseConditions.procesos = { some: { responsable: responsable as ResponsableTipo } }
    }
    if (tipoObraAuditoria) {
      baseConditions.tipoObraAuditoria = tipoObraAuditoria as TipoObraAuditoria
    }

    // Construir condiciones adicionales que requieren AND
    const andConditions: any[] = []

    // Filtro período - manejo especial para 2022-2023 que debe incluir obras sin período
    const periodoEnum = periodo ? (periodo as PeriodoAuditoria) : null
    let where: any
    let needsSpecialPeriodQuery = false

    if (periodoEnum === PeriodoAuditoria.PERIODO_2022_2023) {
      // Para 2022-2023 necesitamos incluir obras con ese período O sin período (antiguas)
      // Como Prisma con MongoDB no maneja bien null en enums, hacemos dos consultas
      needsSpecialPeriodQuery = true
    } else if (periodoEnum) {
      // Para otros períodos, simplemente filtramos por el enum
      baseConditions.periodo = periodoEnum
    }

    // Búsqueda por texto
    if (search) {
      andConditions.push({
        OR: [
          { numero: { contains: search, mode: "insensitive" } },
          { nombre: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    // Combinar todas las condiciones (excepto período si es 2022-2023)
    if (andConditions.length > 0) {
      where = {
        AND: [
          baseConditions,
          ...andConditions,
        ],
      }
    } else {
      where = baseConditions
    }

    // Log para depuración
    console.log("🔍 Filtro período:", periodo)
    console.log("🔍 Necesita consulta especial:", needsSpecialPeriodQuery)
    console.log("🔍 Where construido:", JSON.stringify(where, null, 2))

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let obras: any[]
    let total: number

    if (needsSpecialPeriodQuery) {
      // Para 2022-2023: hacer dos consultas y combinarlas
      // Consulta 1: obras con periodo = PERIODO_2022_2023
      const whereConPeriodo = andConditions.length > 0
        ? { AND: [{ ...baseConditions, periodo: PeriodoAuditoria.PERIODO_2022_2023 }, ...andConditions] }
        : { ...baseConditions, periodo: PeriodoAuditoria.PERIODO_2022_2023 }
      
      // Consulta 2: obras sin periodo o con periodo null
      // Construimos el where sin el filtro de período y luego filtramos manualmente
      const whereSinPeriodoFiltro = andConditions.length > 0
        ? { AND: [baseConditions, ...andConditions] }
        : baseConditions
      
      // Hacemos la consulta sin filtro de período y luego filtramos en memoria
      // para incluir solo obras con periodo null/undefined o PERIODO_2022_2023
      const [obrasConPeriodo, todasLasObrasSinFiltroPeriodo, totalConPeriodo] = await Promise.all([
        prisma.obra.findMany({
          where: whereConPeriodo,
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
        }),
        // Consulta sin filtro de período para obtener obras antiguas
        prisma.obra.findMany({
          where: whereSinPeriodoFiltro,
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
        }),
        prisma.obra.count({ where: whereConPeriodo }),
      ])
      
      // Filtrar obras sin período o con período null/undefined (obras antiguas)
      // Excluir obras con otros períodos y las que ya están en obrasConPeriodo
      const idsConPeriodo = new Set(obrasConPeriodo.map(o => o.id))
      const obrasSinPeriodo = todasLasObrasSinFiltroPeriodo.filter(obra => 
        !idsConPeriodo.has(obra.id) && // No incluir duplicados
        (!obra.periodo || obra.periodo === null) // Solo obras sin período o con null
      )
      
      // Combinar resultados, eliminar duplicados por ID, ordenar y paginar
      const todasLasObras = [...obrasConPeriodo, ...obrasSinPeriodo]
      const obrasUnicas = Array.from(
        new Map(todasLasObras.map(obra => [obra.id, obra])).values()
      )
      obrasUnicas.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      obras = obrasUnicas.slice(skip, skip + limit)
      
      total = obrasUnicas.length
    } else {
      // Consulta normal para otros casos
      const [obrasResult, totalResult] = await Promise.all([
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
      obras = obrasResult
      total = totalResult
    }

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

