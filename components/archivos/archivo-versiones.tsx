"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import { formatFileSize, formatDate } from "@/lib/utils"

interface ArchivoVersionesProps {
  archivoId: string
  onClose: () => void
}

export function ArchivoVersiones({ archivoId, onClose }: ArchivoVersionesProps) {
  const { data: versiones, isLoading } = useQuery({
    queryKey: ["archivo-versiones", archivoId],
    queryFn: async () => {
      const res = await fetch(`/api/archivos/${archivoId}/versiones`)
      if (!res.ok) throw new Error("Error al cargar versiones")
      return res.json()
    },
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Versiones</CardTitle>
              <CardDescription>
                Versiones anteriores de este archivo
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          {isLoading ? (
            <div className="text-center py-8">Cargando versiones...</div>
          ) : versiones && versiones.length > 0 ? (
            <div className="space-y-2">
              {versiones.map((version: any, index: number) => (
                <div
                  key={version.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    index === 0 ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{version.nombreOriginal}</p>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        v{version.version}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(version.tamano)} • {formatDate(version.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`/api/archivos/${version.id}/download`, "_blank")
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay versiones anteriores
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

