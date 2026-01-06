"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Search, Building2, Loader2 } from "lucide-react"
import { Obra } from "@prisma/client"
import { Pagination } from "@/components/ui/pagination"

interface ObraWithProgress extends Obra {
  avance: number
  procesos: Array<{ estado: string; responsable: string }>
}

export default function ObrasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAño, setFiltroAño] = useState<string>("")
  const [filtroMes, setFiltroMes] = useState<string>("")
  const [filtroEstado, setFiltroEstado] = useState<string>("")
  const [filtroResponsable, setFiltroResponsable] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: obrasData, isLoading } = useQuery<{
    obras: ObraWithProgress[]
    total: number
  }>({
    queryKey: ["obras", searchTerm, filtroAño, filtroMes, filtroEstado, filtroResponsable],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filtroAño) params.append("ano", filtroAño)
      if (filtroMes) params.append("mes", filtroMes)
      if (filtroEstado) params.append("estado", filtroEstado)
      if (filtroResponsable) params.append("responsable", filtroResponsable)
      params.append("page", currentPage.toString())
      params.append("limit", itemsPerPage.toString())
      
      const res = await fetch(`/api/obras?${params.toString()}`)
      if (!res.ok) throw new Error("Error al cargar obras")
      return res.json()
    },
  })

  const obras = obrasData?.obras || []
  const totalPages = obrasData?.total ? Math.ceil(obrasData.total / itemsPerPage) : 1

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroAño, filtroMes, filtroEstado, filtroResponsable])

  const años = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
  const meses = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "FINALIZADA":
        return "bg-green-100 text-green-800"
      case "EN_PROCESO":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProcesoColor = (responsable: string) => {
    switch (responsable) {
      case "ENGINEER":
        return "bg-red-500"
      case "ACCOUNTANT":
        return "bg-gray-900"
      case "BOTH":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Obras</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestión y búsqueda de obras</p>
        </div>
        <Link href="/dashboard/obras/nueva" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Obra
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda y Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filtroAño}
              onChange={(e) => setFiltroAño(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos los años</option>
              {años.map((año) => (
                <option key={año} value={año.toString()}>
                  {año}
                </option>
              ))}
            </select>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos los meses</option>
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="NO_INICIADA">No Iniciada</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>
            <select
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos los responsables</option>
              <option value="ENGINEER">Ingeniero</option>
              <option value="ACCOUNTANT">Contador</option>
              <option value="BOTH">Ambos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Obras</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Cargando obras...</p>
            </div>
          ) : obras && obras.length > 0 ? (
            <div className="space-y-4">
              {obras.map((obra) => (
                <Link
                  key={obra.id}
                  href={`/dashboard/obras/${obra.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">
                            {obra.numero} - {obra.nombre}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {obra.mes}/{obra.ano}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-medium">{obra.avance}%</div>
                        <div className="text-xs text-muted-foreground">Avance</div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getEstadoColor(obra.estado)}`}
                      >
                        {obra.estado.replace("_", " ")}
                      </span>
                      {/* Semáforos de procesos */}
                      <div className="flex gap-1 flex-shrink-0">
                        {Array.from({ length: 8 }).map((_, i) => {
                          const proceso = obra.procesos?.[i]
                          return (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${proceso ? getProcesoColor(proceso.responsable) : "bg-gray-200"}`}
                              title={`Proceso ${i + 1}`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron obras
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

