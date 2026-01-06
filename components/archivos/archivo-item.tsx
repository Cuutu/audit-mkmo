"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Eye, History } from "lucide-react"
import { formatFileSize, formatDate } from "@/lib/utils"
import { FilePreview } from "./file-preview"
import { ArchivoVersiones } from "./archivo-versiones"

interface ArchivoItemProps {
  archivo: {
    id: string
    nombreOriginal: string
    tamano: number
    version: number
    createdAt: Date
    tipo: string
    archivoAnteriorId?: string | null
  }
  onDelete: (id: string) => void
  obraId?: string
  procesoId?: string
}

export function ArchivoItem({ archivo, onDelete, obraId, procesoId }: ArchivoItemProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showVersiones, setShowVersiones] = useState(false)

  const canPreview = archivo.tipo.startsWith("image/") || archivo.tipo === "application/pdf"

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{archivo.nombreOriginal}</p>
            {archivo.version > 1 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                v{archivo.version}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(archivo.tamano)} • {formatDate(archivo.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {canPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {archivo.archivoAnteriorId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersiones(true)}
              title="Ver versiones anteriores"
            >
              <History className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(`/api/archivos/${archivo.id}/download`, "_blank")
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(archivo.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showPreview && (
        <FilePreview
          archivo={archivo}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showVersiones && archivo.archivoAnteriorId && (
        <ArchivoVersiones
          archivoId={archivo.id}
          onClose={() => setShowVersiones(false)}
        />
      )}
    </>
  )
}

