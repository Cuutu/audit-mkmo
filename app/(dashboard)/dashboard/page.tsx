import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, Search, FileText, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Obtener KPIs
  const [obrasCount, obrasEnAuditoria, obrasPendientes, obrasCerradas] = await Promise.all([
    prisma.obra.count({ where: { deleted: false } }),
    prisma.obra.count({ where: { estado: "EN_PROCESO", deleted: false } }),
    prisma.obra.count({ where: { estado: "NO_INICIADA", deleted: false } }),
    prisma.obra.count({ where: { estado: "FINALIZADA", deleted: false } }),
  ])

  // Obtener obras recientes
  const obrasRecientes = await prisma.obra.findMany({
    where: { deleted: false },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      createdBy: {
        select: { name: true },
      },
    },
  })

  // Obtener estadísticas optimizadas usando agregaciones
  const [obrasPorMesData, obrasPorEstadoData, avanceData] = await Promise.all([
    // Obras por mes (últimos 6 meses) - usando agregación
    prisma.obra.groupBy({
      by: ["mes", "ano"],
      where: { deleted: false },
      _count: true,
      orderBy: [{ ano: "desc" }, { mes: "desc" }],
      take: 6,
    }),
    // Obras por estado - usando agregación
    prisma.obra.groupBy({
      by: ["estado"],
      where: { deleted: false },
      _count: true,
    }),
    // Avance promedio - usando agregación
    prisma.obra.aggregate({
      where: { deleted: false },
      _avg: { avance: true },
    }),
  ])

  // Formatear datos para gráficos
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const obrasPorMesArray = obrasPorMesData
    .reverse() // Ordenar cronológicamente
    .map((item) => ({
      mes: `${meses[item.mes - 1]} ${item.ano}`,
      cantidad: item._count,
    }))

  const obrasPorEstadoArray = obrasPorEstadoData.map((item) => ({
    estado: item.estado,
    cantidad: item._count,
  }))

  const avancePromedio = Math.round(avanceData._avg.avance || 0)

  // Etapas atrasadas (procesos en EN_CURSO por más de 30 días sin actualizar)
  const fechaLimite = new Date()
  fechaLimite.setDate(fechaLimite.getDate() - 30)

  const procesosAtrasados = await prisma.proceso.count({
    where: {
      estado: "EN_CURSO",
      updatedAt: {
        lt: fechaLimite,
      },
      obra: {
        deleted: false,
      },
    },
  })

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bienvenido, <span className="font-medium text-foreground">{session?.user?.name}</span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Obras</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{obrasCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">En Auditoría</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{obrasEnAuditoria}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pendientes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{obrasPendientes}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cerradas</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{obrasCerradas}</div>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-soft ${procesosAtrasados > 0 ? "bg-gradient-to-br from-red-50 to-rose-50/50" : "bg-gradient-to-br from-white to-slate-50/50"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Etapas Atrasadas</CardTitle>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${procesosAtrasados > 0 ? "bg-red-100" : "bg-muted"}`}>
              <AlertTriangle className={`h-4 w-4 ${procesosAtrasados > 0 ? "text-red-600" : "text-muted-foreground"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${procesosAtrasados > 0 ? "text-red-600" : ""}`}>
              {procesosAtrasados}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Estadísticas */}
      <DashboardStats
        obrasPorMes={obrasPorMesArray}
        obrasPorEstado={obrasPorEstadoArray}
        avancePromedio={avancePromedio}
        etapasAtrasadas={procesosAtrasados}
      />

      {/* Accesos directos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 group">
          <CardHeader>
            <CardTitle className="text-lg">Nueva Obra</CardTitle>
            <CardDescription className="text-sm">Crear una nueva obra en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/obras/nueva">
              <Button className="w-full group-hover:shadow-md transition-all">
                <Building2 className="mr-2 h-4 w-4" />
                Crear Obra
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 group">
          <CardHeader>
            <CardTitle className="text-lg">Buscar Obra</CardTitle>
            <CardDescription className="text-sm">Buscar obras existentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/obras">
              <Button variant="outline" className="w-full group-hover:shadow-sm transition-all">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 group">
          <CardHeader>
            <CardTitle className="text-lg">Reportes</CardTitle>
            <CardDescription className="text-sm">Generar reportes y análisis</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reportes">
              <Button variant="outline" className="w-full group-hover:shadow-sm transition-all">
                <FileText className="mr-2 h-4 w-4" />
                Ver Reportes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Obras recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Obras Recientes</CardTitle>
          <CardDescription>Últimas obras modificadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obrasRecientes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay obras registradas aún
              </p>
            ) : (
              obrasRecientes.map((obra) => (
                <Link
                  key={obra.id}
                  href={`/dashboard/obras/${obra.id}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/50 rounded-xl hover:bg-accent/50 hover:border-border transition-all duration-200 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate group-hover:text-primary transition-colors">
                      {obra.numero} - {obra.nombre}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {obra.mes}/{obra.ano} • {obra.createdBy.name}
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-sm font-semibold">{obra.avance}%</div>
                    <div className="text-xs text-muted-foreground">{obra.estado}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

