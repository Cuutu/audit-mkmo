"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, AlertTriangle, Building2 } from "lucide-react"
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

interface ObraEliminada {
  id: string
  numero: string
  nombre: string
  ano: number
  mes: number
  deletedAt: Date | null
  createdBy: { name: string }
}

interface PapeleraClientProps {
  archivos: ArchivoEliminado[]
  obras: ObraEliminada[]
  userRole: Role
}

export function PapeleraClient({ archivos, obras, userRole }: PapeleraClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [restaurandoObra, setRestaurandoObra] = useState<string | null>(null)
  const [eliminandoObra, setEliminandoObra] = useState<string | null>(null)
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

  const handleRestoreObra = async (obraId: string) => {
    setRestaurandoObra(obraId)
    try {
      const res = await fetch(`/api/obras/${obraId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }))
        alert(errorData.error || "Error al restaurar obra")
        return
      }

      const result = await res.json()
      router.refresh()
    } catch (error) {
      console.error("Error al restaurar obra:", error)
      alert("Error al restaurar obra. Por favor, intente nuevamente.")
    } finally {
      setRestaurandoObra(null)
    }
  }

  const handlePermanentDeleteObra = async (obraId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta obra DEFINITIVAMENTE? Esta acción eliminará también todos sus procesos y archivos asociados. Esta acción no se puede deshacer.")) {
      return
    }

    setEliminandoObra(obraId)
    try {
      const res = await fetch(`/api/obras/${obraId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al eliminar obra")
        return
      }

      router.refresh()
    } catch (error) {
      alert("Error al eliminar obra")
    } finally {
      setEliminandoObra(null)
    }
  }

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Papelera</h1>
        <p className="text-muted-foreground">
          Obras y archivos eliminados que pueden ser restaurados
        </p>
      </div>

      {!isAdmin && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                Solo los administradores pueden eliminar elementos definitivamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Obras Eliminadas */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Obras Eliminadas
          </CardTitle>
          <CardDescription>
            {obras.length} obra{obras.length !== 1 ? "s" : ""} en la papelera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {obras.length > 0 ? (
            <div className="space-y-3">
              {obras.map((obra) => (
                <div
                  key={obra.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-gradient-to-r from-white to-red-50/30 hover:shadow-soft transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{obra.numero} - {obra.nombre}</p>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <p>
                        {meses[obra.mes - 1]} {obra.ano} • Creada por {obra.createdBy.name}
                      </p>
                      {obra.deletedAt && (
                        <p>
                          Eliminada el {formatDate(obra.deletedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreObra(obra.id)}
                      disabled={restaurandoObra === obra.id}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {restaurandoObra === obra.id ? "Restaurando..." : "Restaurar"}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handlePermanentDeleteObra(obra.id)}
                        disabled={eliminandoObra === obra.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {eliminandoObra === obra.id ? "Eliminando..." : "Eliminar Definitivo"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay obras eliminadas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archivos Eliminados */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Archivos Eliminados</CardTitle>
          <CardDescription>
            {archivos.length} archivo{archivos.length !== 1 ? "s" : ""} en la papelera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {archivos.length > 0 ? (
            <div className="space-y-3">
              {archivos.map((archivo) => (
                <div
                  key={archivo.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-gradient-to-r from-white to-blue-50/30 hover:shadow-soft transition-all"
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

