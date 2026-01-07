"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Search, Building2, Loader2 } from "lucide-react"
import { Obra } from "@prisma/client"
import { Pagination } from "@/components/ui/pagination"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { ObraListSkeleton } from "@/components/ui/skeleton"

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

  // Debounce de búsqueda para evitar queries excesivas
  const debouncedSearchTerm = useDebounce(searchTerm, 400)

  const { data: obrasData, isLoading } = useQuery<{
    obras: ObraWithProgress[]
    total: number
  }>({
    queryKey: ["obras", debouncedSearchTerm, filtroAño, filtroMes, filtroEstado, filtroResponsable, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm)
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
    staleTime: 2 * 60 * 1000, // 2 minutos para datos de obras
  })

  const obras = obrasData?.obras || []
  const totalPages = obrasData?.total ? Math.ceil(obrasData.total / itemsPerPage) : 1

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, filtroAño, filtroMes, filtroEstado, filtroResponsable])

  // Memoizar funciones de estilo para evitar recreaciones
  const getEstadoColor = useMemo(() => (estado: string) => {
    switch (estado) {
      case "FINALIZADA":
        return "bg-green-100 text-green-800"
      case "EN_PROCESO":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const getProcesoColor = useMemo(() => (responsable: string) => {
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
  }, [])

  // Memoizar arrays estáticos
  const años = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i), [])
  const meses = useMemo(() => [
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
  ], [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Obras</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestión y búsqueda de obras</p>
        </div>
        <Link href="/dashboard/obras/nueva" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto shadow-sm hover:shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Obra
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Búsqueda y Filtros</CardTitle>
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
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <select
              value={filtroAño}
              onChange={(e) => setFiltroAño(e.target.value)}
              className="h-11 rounded-lg border border-input/50 bg-background px-4 py-2 text-sm transition-all hover:border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
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
              className="h-11 rounded-lg border border-input/50 bg-background px-4 py-2 text-sm transition-all hover:border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
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
              className="h-11 rounded-lg border border-input/50 bg-background px-4 py-2 text-sm transition-all hover:border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              <option value="">Todos los estados</option>
              <option value="NO_INICIADA">No Iniciada</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>
            <select
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="h-11 rounded-lg border border-input/50 bg-background px-4 py-2 text-sm transition-all hover:border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
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
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Listado de Obras</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ObraListSkeleton />
          ) : obras && obras.length > 0 ? (
            <div className="space-y-3">
              {obras.map((obra) => (
                <Link
                  key={obra.id}
                  href={`/dashboard/obras/${obra.id}`}
                  className="block p-5 border border-border/50 rounded-xl hover:bg-accent/50 hover:border-border hover:shadow-soft transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate group-hover:text-primary transition-colors">
                            {obra.numero} - {obra.nombre}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {obra.mes}/{obra.ano}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-base font-semibold">{obra.avance}%</div>
                        <div className="text-xs text-muted-foreground">Avance</div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${getEstadoColor(obra.estado)}`}
                      >
                        {obra.estado.replace("_", " ")}
                      </span>
                      {/* Semáforos de procesos */}
                      <div className="flex gap-1 flex-shrink-0" role="group" aria-label="Estado de procesos">
                        {Array.from({ length: 8 }).map((_, i) => {
                          const proceso = obra.procesos?.[i]
                          return (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full transition-all ${proceso ? getProcesoColor(proceso.responsable) : "bg-gray-200"}`}
                              title={`Proceso ${i + 1}: ${proceso ? proceso.responsable : "No iniciado"}`}
                              aria-label={`Proceso ${i + 1}`}
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

