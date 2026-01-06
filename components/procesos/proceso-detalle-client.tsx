"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Obra, Proceso, User, ProcesoEstado, ResponsableTipo, Prisma } from "@prisma/client"
import { formatDate, formatFileSize } from "@/lib/utils"
import { FileUpload } from "@/components/ui/file-upload"
import { ChecklistEditor, ChecklistItem } from "./checklist-editor"
import { ProcesoFields } from "./proceso-fields"
import { ProcesoHistorial } from "./proceso-historial"
import { ArchivoItem } from "@/components/archivos/archivo-item"

type ProcesoWithRelations = Proceso & {
  responsableUser: { name: string; email: string } | null
  archivos: Array<{
    id: string
    nombreOriginal: string
    tamano: number
    version: number
    createdAt: Date
    subidoPor: { name: string }
  }>
  checklist?: Prisma.JsonValue | null
  datos?: Prisma.JsonValue | null
}

interface ProcesoDetalleClientProps {
  obra: Obra
  proceso: ProcesoWithRelations
}

export function ProcesoDetalleClient({ obra, proceso }: ProcesoDetalleClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [estado, setEstado] = useState<ProcesoEstado>(proceso.estado)
  const [avance, setAvance] = useState(proceso.avance.toString())
  const [observaciones, setObservaciones] = useState(proceso.observaciones || "")
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const getResponsableColor = (responsable: ResponsableTipo) => {
    switch (responsable) {
      case "ENGINEER":
        return "bg-red-500 text-white"
      case "ACCOUNTANT":
        return "bg-gray-900 text-white"
      case "BOTH":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-300"
    }
  }

  const getResponsableLabel = (responsable: ResponsableTipo) => {
    switch (responsable) {
      case "ENGINEER":
        return "Ingeniero"
      case "ACCOUNTANT":
        return "Contador"
      case "BOTH":
        return "Ambos"
      default:
        return "Sin asignar"
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/procesos/${proceso.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado,
          avance: parseInt(avance),
          observaciones,
        }),
      })

      if (!res.ok) throw new Error("Error al guardar")

      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("procesoId", proceso.id)

    const res = await fetch(`/api/obras/${obra.id}/archivos/upload`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Error al subir archivo")
    }

    // Refrescar página para ver el nuevo archivo
    router.refresh()
    setShowUpload(false)
  }

  const handleDeleteArchivo = async (archivoId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este archivo?")) {
      return
    }

    const res = await fetch(`/api/archivos/${archivoId}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || "Error al eliminar archivo")
      return
    }

    router.refresh()
  }

  const handleChecklistSave = async (items: ChecklistItem[]) => {
    const res = await fetch(`/api/procesos/${proceso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist: items }),
    })

    if (!res.ok) {
      throw new Error("Error al guardar checklist")
    }

    router.refresh()
  }

  const handleDatosSave = async (datos: Record<string, any>) => {
    const res = await fetch(`/api/procesos/${proceso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datos }),
    })

    if (!res.ok) {
      throw new Error("Error al guardar datos")
    }

    router.refresh()
  }

  // Convertir checklist de JSON a ChecklistItem[]
  const checklistItems: ChecklistItem[] = proceso.checklist && typeof proceso.checklist === 'object' && proceso.checklist !== null
    ? (Array.isArray(proceso.checklist)
        ? (proceso.checklist as any[])
        : [])
        .map((item: any, index: number) => ({
          id: item.id || index.toString(),
          texto: item.texto || item.text || String(item),
          completado: item.completado || item.completed || false,
          requerido: item.requerido || item.required || false,
        }))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/obras/${obra.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            Proceso {proceso.numero}: {proceso.nombre}
          </h1>
          <p className="text-muted-foreground">
            Obra: {obra.numero} - {obra.nombre}
          </p>
        </div>
      </div>

      {/* Información del proceso */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Proceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as ProcesoEstado)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="NO_INICIADO">No Iniciado</option>
                <option value="EN_CURSO">En Curso</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="APROBADO">Aprobado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Avance (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={avance}
                onChange={(e) => setAvance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <div
                className={`px-3 py-2 rounded-md text-sm font-medium ${getResponsableColor(proceso.responsable)}`}
              >
                {getResponsableLabel(proceso.responsable)}
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado:</span>
              <span className="font-medium">{formatDate(proceso.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última actualización:</span>
              <span className="font-medium">{formatDate(proceso.updatedAt)}</span>
            </div>
            {proceso.responsableUser && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuario asignado:</span>
                <span className="font-medium">{proceso.responsableUser.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <ChecklistEditor
        items={checklistItems}
        onSave={handleChecklistSave}
      />

      {/* Campos Estructurados */}
      <ProcesoFields
        procesoNumero={proceso.numero}
        datosIniciales={proceso.datos && typeof proceso.datos === 'object' && proceso.datos !== null ? (proceso.datos as Record<string, any>) : null}
        onSave={handleDatosSave}
      />

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Agregar observaciones sobre el proceso..."
          />
        </CardContent>
      </Card>

      {/* Historial de Cambios */}
      <ProcesoHistorial procesoId={proceso.id} />

      {/* Archivos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Archivos del Proceso</CardTitle>
              <CardDescription>
                Archivos adjuntos relacionados con este proceso
              </CardDescription>
            </div>
            <Button onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? "Cancelar" : "Subir Archivo"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showUpload && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <FileUpload
                onUpload={handleFileUpload}
                obraId={obra.id}
                procesoId={proceso.id}
              />
            </div>
          )}
          {proceso.archivos.length > 0 ? (
            <div className="space-y-2">
              {proceso.archivos.map((archivo: any) => (
                <ArchivoItem
                  key={archivo.id}
                  archivo={{
                    ...archivo,
                    tipo: archivo.tipo || "application/octet-stream",
                    archivoAnteriorId: archivo.archivoAnteriorId || null,
                  }}
                  onDelete={handleDeleteArchivo}
                  obraId={obra.id}
                  procesoId={proceso.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay archivos subidos aún
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

