"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDateTime } from "@/lib/utils"

interface BitacoraTabProps {
  obraId: string
}

export function BitacoraTab({ obraId }: BitacoraTabProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", obraId],
    queryFn: async () => {
      const res = await fetch(`/api/obras/${obraId}/bitacora`)
      if (!res.ok) throw new Error("Error al cargar bitácora")
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Cargando bitácora...</div>
  }

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Registro de Actividad</h3>
      {logs && logs.length > 0 ? (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <div
              key={log.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getAccionColor(log.accion)}`}
                    >
                      {log.accion}
                    </span>
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {log.entidad}
                    </span>
                  </div>
                  {log.campo && (
                    <p className="text-sm text-muted-foreground">
                      Campo: {log.campo}
                    </p>
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
          No hay registros de actividad aún
        </div>
      )}
    </div>
  )
}

