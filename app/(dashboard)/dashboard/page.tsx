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

  // Obtener estadísticas para gráficos
  const todasLasObras = await prisma.obra.findMany({
    where: { deleted: false },
    select: { mes: true, ano: true, estado: true, avance: true },
  })

  // Obras por mes (últimos 6 meses)
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const obrasPorMes: Record<string, number> = {}
  todasLasObras.forEach((obra) => {
    const key = `${meses[obra.mes - 1]} ${obra.ano}`
    obrasPorMes[key] = (obrasPorMes[key] || 0) + 1
  })
  const obrasPorMesArray = Object.entries(obrasPorMes)
    .slice(-6)
    .map(([mes, cantidad]) => ({ mes, cantidad }))

  // Obras por estado
  const obrasPorEstado: Record<string, number> = {}
  todasLasObras.forEach((obra) => {
    obrasPorEstado[obra.estado] = (obrasPorEstado[obra.estado] || 0) + 1
  })
  const obrasPorEstadoArray = Object.entries(obrasPorEstado).map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }))

  // Avance promedio
  const avancePromedio =
    todasLasObras.length > 0
      ? Math.round(todasLasObras.reduce((acc, obra) => acc + obra.avance, 0) / todasLasObras.length)
      : 0

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bienvenido, {session?.user?.name}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Obras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Auditoría</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasEnAuditoria}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasPendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasCerradas}</div>
          </CardContent>
        </Card>
        <Card className={procesosAtrasados > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapas Atrasadas</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${procesosAtrasados > 0 ? "text-red-600" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${procesosAtrasados > 0 ? "text-red-600" : ""}`}>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Nueva Obra</CardTitle>
            <CardDescription>Crear una nueva obra en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/obras/nueva">
              <Button className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Crear Obra
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Buscar Obra</CardTitle>
            <CardDescription>Buscar obras existentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/obras">
              <Button variant="outline" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
            <CardDescription>Generar reportes y análisis</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reportes">
              <Button variant="outline" className="w-full">
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {obra.numero} - {obra.nombre}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {obra.mes}/{obra.ano} • {obra.createdBy.name}
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-sm font-medium">{obra.avance}%</div>
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

