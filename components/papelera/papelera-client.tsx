"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react"
import { formatFileSize, formatDate } from "@/lib/utils"
import { Role } from "@prisma/client"

interface ArchivoEliminado {
  id: string
  nombreOriginal: string
  tamano: number
  tipo: string
  version: number
  deletedAt: Date | null
  obra?: { numero: string; nombre: string } | null
  proceso?: { numero: number; nombre: string } | null
  subidoPor: { name: string }
  deletedBy?: { name: string } | null
}

interface PapeleraClientProps {
  archivos: ArchivoEliminado[]
  userRole: Role
}

export function PapeleraClient({ archivos, userRole }: PapeleraClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const isAdmin = userRole === "ADMIN"

  const handleRestore = async (archivoId: string) => {
    setRestaurando(archivoId)
    try {
      const res = await fetch(`/api/archivos/${archivoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al restaurar archivo")
        return
      }

      router.refresh()
    } catch (error) {
      alert("Error al restaurar archivo")
    } finally {
      setRestaurando(null)
    }
  }

  const handlePermanentDelete = async (archivoId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este archivo DEFINITIVAMENTE? Esta acción no se puede deshacer.")) {
      return
    }

    setEliminando(archivoId)
    try {
      const res = await fetch(`/api/archivos/${archivoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "permanent-delete" }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al eliminar archivo")
        return
      }

      router.refresh()
    } catch (error) {
      alert("Error al eliminar archivo")
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Papelera</h1>
        <p className="text-muted-foreground">
          Archivos eliminados que pueden ser restaurados
        </p>
      </div>

      {!isAdmin && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                Solo los administradores pueden eliminar archivos definitivamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Archivos Eliminados</CardTitle>
          <CardDescription>
            {archivos.length} archivo{archivos.length !== 1 ? "s" : ""} en la papelera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {archivos.length > 0 ? (
            <div className="space-y-2">
              {archivos.map((archivo) => (
                <div
                  key={archivo.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{archivo.nombreOriginal}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {formatFileSize(archivo.tamano)} • Versión {archivo.version} •{" "}
                        {formatDate(archivo.deletedAt!)}
                      </p>
                      {archivo.obra && (
                        <p>
                          Obra: {archivo.obra.numero} - {archivo.obra.nombre}
                        </p>
                      )}
                      {archivo.proceso && (
                        <p>
                          Proceso {archivo.proceso.numero}: {archivo.proceso.nombre}
                        </p>
                      )}
                      <p>
                        Subido por: {archivo.subidoPor.name} • Eliminado por:{" "}
                        {archivo.deletedBy?.name || "Sistema"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(archivo.id)}
                      disabled={restaurando === archivo.id}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {restaurando === archivo.id ? "Restaurando..." : "Restaurar"}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(archivo.id)}
                        disabled={eliminando === archivo.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {eliminando === archivo.id ? "Eliminando..." : "Eliminar Definitivo"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              La papelera está vacía
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

