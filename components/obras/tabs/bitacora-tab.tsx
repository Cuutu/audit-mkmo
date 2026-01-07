"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatDateTime } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { FileText } from "lucide-react"

interface BitacoraTabProps {
  obraId: string
}

export function BitacoraTab({ obraId }: BitacoraTabProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["audit-logs", obraId, currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/obras/${obraId}/bitacora?page=${currentPage}&limit=${itemsPerPage}`)
      if (!res.ok) throw new Error("Error al cargar bitácora")
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  const logs = logsData?.logs || []
  const totalPages = logsData?.totalPages || 1


  const getAccionColor = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "READ":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAccionLabel = (accion: string, entidad: string, campo?: string) => {
    if (accion === "READ" && entidad === "Reporte") {
      if (campo?.includes("reporte_global")) {
        return "Generó reporte global"
      } else if (campo?.includes("reporte_completo")) {
        return "Generó reporte completo (PDF)"
      } else if (campo?.includes("reporte_matriz")) {
        return "Generó matriz de control (PDF)"
      } else if (campo?.includes("reporte_flujo")) {
        return "Generó diagrama de flujo (PDF)"
      } else if (campo?.includes("reporte_excel")) {
        return "Generó reporte Excel"
      }
      return "Generó reporte"
    }
    switch (accion) {
      case "CREATE":
        return "Creó"
      case "UPDATE":
        return "Actualizó"
      case "DELETE":
        return "Eliminó"
      case "READ":
        return "Consultó"
      default:
        return accion
    }
  }

  const getDetalleAccion = (log: any) => {
    if (log.accion === "READ" && log.entidad === "Reporte" && log.valorNuevo) {
      try {
        const detalle = JSON.parse(log.valorNuevo)
        if (detalle.tipo && detalle.formato) {
          return `${detalle.tipo} (${detalle.formato.toUpperCase()})`
        }
        if (detalle.filtros) {
          return `Global - Filtros: ${Object.entries(detalle.filtros).map(([k, v]) => `${k}: ${v}`).join(", ")}`
        }
      } catch (e) {
        // Ignorar error de parse
      }
    }
    if (log.campo) {
      return log.campo.replace(/_/g, " ")
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">Registro de Actividad</h3>
        <p className="text-sm text-muted-foreground">
          Historial completo de acciones realizadas en esta obra
        </p>
      </div>
      {logs && logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log: any) => {
            const detalle = getDetalleAccion(log)
            return (
              <div
                key={log.id}
                className="p-4 border border-border/50 rounded-xl hover:bg-accent/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getAccionColor(log.accion)}`}
                      >
                        {getAccionLabel(log.accion, log.entidad, log.campo)}
                      </span>
                      <span className="font-semibold text-sm">{log.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {log.entidad}
                      </span>
                    </div>
                    {detalle && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {detalle}
                      </p>
                    )}
                    {log.valorAnterior && log.valorNuevo && log.accion === "UPDATE" && (
                      <p className="text-xs text-muted-foreground italic">
                        Se realizaron cambios en los datos
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {formatDateTime(log.createdAt)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No hay registros"
          description="Aún no se han registrado actividades para esta obra."
        />
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
    </div>
  )
}

