"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FilePreviewProps {
  archivo: {
    id: string
    nombreOriginal: string
    tipo: string
    tamano: number
  }
  onClose: () => void
}

export function FilePreview({ archivo, onClose }: FilePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const isImage = archivo.tipo.startsWith("image/")
  const isPDF = archivo.tipo === "application/pdf"

  const previewUrl = `/api/archivos/${archivo.id}/download`

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1">
            <h3 className="font-semibold">{archivo.nombreOriginal}</h3>
            <p className="text-sm text-muted-foreground">{archivo.tipo}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(previewUrl, "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="flex-1 overflow-auto p-0">
          {isImage ? (
            <div className="flex items-center justify-center min-h-[400px] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={archivo.nombreOriginal}
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          ) : isPDF ? (
            <div className="w-full h-[70vh]">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
                title={archivo.nombreOriginal}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
              <p className="text-muted-foreground mb-4">
                Vista previa no disponible para este tipo de archivo
              </p>
              <Button onClick={() => window.open(previewUrl, "_blank")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar archivo
              </Button>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
              <p className="text-red-600 mb-4">Error al cargar la vista previa</p>
              <Button onClick={() => window.open(previewUrl, "_blank")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar archivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

