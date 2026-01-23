"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import { ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react"

interface ProcesoHistorialProps {
  procesoId: string
}

export function ProcesoHistorial({ procesoId }: ProcesoHistorialProps) {
  const [showAll, setShowAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["proceso-historial", procesoId, showAll ? currentPage : 1, showAll ? limit : 5],
    queryFn: async () => {
      const page = showAll ? currentPage : 1
      const pageLimit = showAll ? limit : 5
      const res = await fetch(`/api/procesos/${procesoId}/historial?page=${page}&limit=${pageLimit}`)
      if (!res.ok) throw new Error("Error al cargar historial")
      return res.json()
    },
  })

  const logs = data?.logs || []
  const pagination = data?.pagination

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">Cargando historial...</CardContent>
      </Card>
    )
  }

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "UPLOAD":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAccionLabel = (accion: string, campo?: string) => {
    switch (accion) {
      case "CREATE":
        return "Creado"
      case "UPDATE":
        return campo ? `Actualizado: ${campo}` : "Actualizado"
      case "DELETE":
        return "Eliminado"
      case "UPLOAD":
        return "Archivo subido"
      default:
        return accion
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historial de Cambios</CardTitle>
            <CardDescription>
              {showAll
                ? `Registro completo de todas las modificaciones (${pagination?.total || 0} total)`
                : "Últimas modificaciones realizadas en este proceso"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <>
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getAccionColor(log.accion)}`}
                      >
                        {getAccionLabel(log.accion, log.campo)}
                      </span>
                      <div className="flex items-center gap-2">
                        {log.user.fotoPerfil ? (
                          <img
                            src={log.user.fotoPerfil}
                            alt={log.user.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{log.user.name}</span>
                      </div>
                    </div>
                      {log.campo && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Campo modificado: <span className="font-medium">{log.campo}</span>
                        </p>
                      )}
                      {log.valorAnterior && log.valorNuevo && log.campo && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex gap-4">
                            <div>
                              <span className="font-medium">Antes:</span>{" "}
                              {typeof log.valorAnterior === "string"
                                ? log.valorAnterior.substring(0, 50)
                                : JSON.stringify(log.valorAnterior).substring(0, 50)}
                              ...
                            </div>
                            <div>
                              <span className="font-medium">Después:</span>{" "}
                              {typeof log.valorNuevo === "string"
                                ? log.valorNuevo.substring(0, 50)
                                : JSON.stringify(log.valorNuevo).substring(0, 50)}
                              ...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!showAll && pagination && pagination.total > 5 && (
              <div className="mt-4 pt-4 border-t flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAll(true)
                    setCurrentPage(1)
                  }}
                >
                  Ver Todos los Cambios ({pagination.total})
                </Button>
              </div>
            )}
            {showAll && pagination && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay registros de cambios aún
          </div>
        )}
      </CardContent>
    </Card>
  )
}

