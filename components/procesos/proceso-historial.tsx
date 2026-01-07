"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"

interface ProcesoHistorialProps {
  procesoId: string
}

export function ProcesoHistorial({ procesoId }: ProcesoHistorialProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["proceso-historial", procesoId],
    queryFn: async () => {
      const res = await fetch(`/api/procesos/${procesoId}/historial`)
      if (!res.ok) throw new Error("Error al cargar historial")
      return res.json()
    },
  })

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
        <CardTitle>Historial de Cambios</CardTitle>
        <CardDescription>
          Registro completo de todas las modificaciones realizadas en este proceso
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
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
                      <span className="font-medium text-sm">{log.user.name}</span>
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay registros de cambios aún
          </div>
        )}
      </CardContent>
    </Card>
  )
}

