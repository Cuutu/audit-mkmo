"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ArchivoItem } from "@/components/archivos/archivo-item"
import { showToast } from "@/components/ui/toast"
import { confirmDialog } from "@/components/ui/confirm-dialog"

interface ArchivosTabProps {
  obraId: string
}

export function ArchivosTab({ obraId }: ArchivosTabProps) {
  const [showUpload, setShowUpload] = useState(false)
  const queryClient = useQueryClient()

  const { data: archivos, isLoading } = useQuery({
    queryKey: ["archivos", obraId],
    queryFn: async () => {
      const res = await fetch(`/api/obras/${obraId}/archivos`)
      if (!res.ok) throw new Error("Error al cargar archivos")
      return res.json()
    },
  })

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/obras/${obraId}/archivos/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al subir archivo")
      }

      // Refrescar lista de archivos
      queryClient.invalidateQueries({ queryKey: ["archivos", obraId] })
      setShowUpload(false)
      showToast("Archivo subido correctamente", "success")
    } catch (error: any) {
      showToast(error.message || "Error al subir archivo", "error")
      throw error
    }
  }

  const handleDelete = async (archivoId: string) => {
    const confirmed = await confirmDialog({
      title: "Eliminar Archivo",
      message: "¿Está seguro de que desea eliminar este archivo? Se moverá a la papelera.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: () => {},
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/archivos/${archivoId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al eliminar archivo")
      }

      queryClient.invalidateQueries({ queryKey: ["archivos", obraId] })
      showToast("Archivo eliminado correctamente", "success")
    } catch (error: any) {
      showToast(error.message || "Error al eliminar archivo", "error")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando archivos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Archivos de la Obra</h3>
        <Button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? "Cancelar" : "Subir Archivo"}
        </Button>
      </div>

      {showUpload && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <FileUpload
            onUpload={handleUpload}
            obraId={obraId}
          />
        </div>
      )}

      {archivos && archivos.length > 0 ? (
        <div className="space-y-2">
          {archivos.map((archivo: any) => (
            <ArchivoItem
              key={archivo.id}
              archivo={archivo}
              onDelete={handleDelete}
              obraId={obraId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No hay archivos subidos aún
        </div>
      )}
    </div>
  )
}

