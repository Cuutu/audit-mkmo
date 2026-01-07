"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Building2, Clock, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"

interface DashboardStatsProps {
  obrasPorMes: Array<{ mes: string; cantidad: number }>
  obrasPorEstado: Array<{ estado: string; cantidad: number }>
  avancePromedio: number
  etapasAtrasadas: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function DashboardStats({
  obrasPorMes,
  obrasPorEstado,
  avancePromedio,
  etapasAtrasadas,
}: DashboardStatsProps) {
  const estadoLabels: Record<string, string> = {
    NO_INICIADA: "No Iniciada",
    EN_PROCESO: "En Proceso",
    FINALIZADA: "Finalizada",
  }

  const obrasPorEstadoFormatted = obrasPorEstado.map((item) => ({
    ...item,
    estado: estadoLabels[item.estado] || item.estado,
  }))

  return (
    <div className="space-y-6">
      {/* Gráfico de Obras por Mes */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Obras por Mes</CardTitle>
          <CardDescription className="text-sm">Distribución de obras creadas por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={obrasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#0088FE" name="Cantidad de Obras" />
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Avance Promedio */}
        <Card>
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
                    className="text-gray-200"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${(avancePromedio / 100) * 502.4} 502.4`}
                    className="text-blue-600"
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Etapas Atrasadas</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Hay {etapasAtrasadas} proceso{etapasAtrasadas !== 1 ? "s" : ""} que requieren atención
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

