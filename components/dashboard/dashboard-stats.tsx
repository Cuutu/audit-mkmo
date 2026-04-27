"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Building2, Clock, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"

const MIN_ANO_DESDE = 2022

interface DashboardStatsProps {
  obrasPorAno: Array<{ anio: string; cantidad: number }>
  desdeAno: number
  anioActual: number
  obrasPorEstado: Array<{ estado: string; cantidad: number }>
  avancePromedio: number
  etapasAtrasadas: number
}

const COLORS_LIGHT = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
const COLORS_DARK = ["#60a5fa", "#34d399", "#fbbf24", "#fb923c"]

export function DashboardStats({
  obrasPorAno,
  desdeAno,
  anioActual,
  obrasPorEstado,
  avancePromedio,
  etapasAtrasadas,
}: DashboardStatsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  const opcionesDesdeAno: number[] = []
  for (let y = MIN_ANO_DESDE; y <= anioActual; y++) opcionesDesdeAno.push(y)

  const onDesdeAnoChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("desde", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    setMounted(true)
    // Detectar tema del DOM directamente
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    
    checkTheme()
    
    // Observar cambios en el tema
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    
    return () => observer.disconnect()
  }, [])

  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT
  
  const estadoLabels: Record<string, string> = {
    NO_INICIADA: "No Iniciada",
    EN_PROCESO: "En Proceso",
    FINALIZADA: "Finalizada",
  }

  const obrasPorEstadoFormatted = obrasPorEstado.map((item) => ({
    ...item,
    estado: estadoLabels[item.estado] || item.estado,
  }))

  // Usar valores por defecto seguros durante SSR
  const chartTextColor = mounted ? (isDark ? "#cbd5e1" : "#1e293b") : "#1e293b"
  const gridColor = mounted ? (isDark ? "#475569" : "#e2e8f0") : "#e2e8f0"
  const tooltipBg = mounted ? (isDark ? "hsl(222.2 47% 10%)" : "#fff") : "#fff"
  const tooltipBorder = mounted ? (isDark ? "hsl(217.2 32.6% 20%)" : "#e2e8f0") : "#e2e8f0"
  const tooltipShadow = mounted ? (isDark ? "0 4px 16px rgba(0, 0, 0, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.1)") : "0 2px 8px rgba(0, 0, 0, 0.1)"

  return (
    <div className="space-y-6">
      {/* Gráfico de Obras por año (campo año de la obra) */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-4 space-y-3 sm:flex sm:flex-row sm:items-start sm:justify-between sm:space-y-0 gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-lg">Obras por Año</CardTitle>
            <CardDescription className="text-sm">
              Cantidad de obras por año del registro (año/mes de obra), desde el año elegido
            </CardDescription>
          </div>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground shrink-0">
            <span className="font-medium">Desde año</span>
            <select
              className="h-9 min-w-[7rem] rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={desdeAno}
              onChange={(e) => onDesdeAnoChange(e.target.value)}
              aria-label="Filtrar gráfico desde año"
            >
              {opcionesDesdeAno.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={obrasPorAno}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis dataKey="anio" stroke={chartTextColor} />
              <YAxis stroke={chartTextColor} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "0.5rem",
                  color: chartTextColor,
                  boxShadow: tooltipShadow,
                }}
                labelStyle={{ color: chartTextColor }}
              />
              <Legend wrapperStyle={{ color: chartTextColor }} />
              <Bar dataKey="cantidad" fill={COLORS[0]} name="Cantidad de Obras" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Obras por Estado */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Obras por Estado</CardTitle>
            <CardDescription className="text-sm">Distribución porcentual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={obrasPorEstadoFormatted}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {obrasPorEstadoFormatted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "0.5rem",
                    color: chartTextColor,
                    boxShadow: tooltipShadow,
                  }}
                  labelStyle={{ color: chartTextColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Avance Promedio */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Avance Promedio</CardTitle>
            <CardDescription>Progreso general de todas las obras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className={mounted && isDark ? "text-slate-600" : "text-gray-200"}
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${(avancePromedio / 100) * 502.4} 502.4`}
                    className={mounted && isDark ? "text-blue-500" : "text-blue-600"}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{avancePromedio}%</div>
                    <div className="text-sm text-muted-foreground">Avance</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Etapas Atrasadas */}
      {etapasAtrasadas > 0 && (
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-red-900 dark:text-red-100">Etapas Atrasadas</CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              Hay {etapasAtrasadas} proceso{etapasAtrasadas !== 1 ? "s" : ""} que requieren atención
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

