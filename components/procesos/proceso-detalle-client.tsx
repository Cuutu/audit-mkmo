"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Obra, Proceso, User, ProcesoEstado, ResponsableTipo, Prisma, Role } from "@prisma/client"
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
  userRole: Role
}

// Función helper para verificar permisos según el rol del usuario y el responsable del proceso
function canModifyProcess(userRole: Role, procesoResponsable: ResponsableTipo): boolean {
  // ADMIN puede modificar todo
  if (userRole === "ADMIN") {
    return true
  }

  // VIEWER no puede modificar nada
  if (userRole === "VIEWER") {
    return false
  }

  // ENGINEER puede modificar procesos con responsable ENGINEER (rojo) y BOTH (amarillo)
  if (userRole === "ENGINEER") {
    return procesoResponsable === "ENGINEER" || procesoResponsable === "BOTH"
  }

  // ACCOUNTANT puede modificar procesos con responsable ACCOUNTANT (verde) y BOTH (amarillo)
  if (userRole === "ACCOUNTANT") {
    return procesoResponsable === "ACCOUNTANT" || procesoResponsable === "BOTH"
  }

  return false
}

export function ProcesoDetalleClient({ obra, proceso, userRole }: ProcesoDetalleClientProps) {
  const canModify = canModifyProcess(userRole, proceso.responsable)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [estado, setEstado] = useState<ProcesoEstado>(proceso.estado)
  const [avance, setAvance] = useState(proceso.avance.toString())
  const [observaciones, setObservaciones] = useState(proceso.observaciones || "")
  
  // Convertir checklist de JSON a ChecklistItem[]
  const initialChecklistItems = useMemo((): ChecklistItem[] => {
    if (proceso.checklist && typeof proceso.checklist === 'object' && proceso.checklist !== null) {
      const checklistArray = Array.isArray(proceso.checklist) ? (proceso.checklist as any[]) : []
      return checklistArray.map((item: any, index: number) => ({
        id: item.id || index.toString(),
        texto: item.texto || item.text || String(item),
        completado: item.completado || item.completed || false,
        requerido: item.requerido || item.required || false,
      }))
    }
    return []
  }, [proceso.checklist])

  const initialDatos = useMemo((): Record<string, any> => {
    return proceso.datos && typeof proceso.datos === 'object' && proceso.datos !== null
      ? (proceso.datos as Record<string, any>)
      : {}
  }, [proceso.datos])

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialChecklistItems)
  const [datosEstructurados, setDatosEstructurados] = useState<Record<string, any>>(initialDatos)

  // Sincronizar estados cuando cambien los valores iniciales del proceso
  useEffect(() => {
    setChecklistItems(initialChecklistItems)
  }, [initialChecklistItems])

  useEffect(() => {
    setDatosEstructurados(initialDatos)
  }, [initialDatos])
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const getResponsableColor = (responsable: ResponsableTipo) => {
    switch (responsable) {
      case "ENGINEER":
        return "bg-red-500 text-white"
      case "ACCOUNTANT":
        return "bg-green-500 text-white"
      case "BOTH":
        return "bg-yellow-500 text-white"
      default:
        return "bg-muted"
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
          checklist: checklistItems,
          datos: datosEstructurados,
        }),
      })

      if (!res.ok) throw new Error("Error al guardar")

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error al guardar los cambios. Por favor, intente nuevamente.")
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
                disabled={!canModify}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!canModify}
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

      {/* Mensaje de permisos si no puede modificar */}
      {!canModify && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                No tiene permisos para modificar este proceso. Solo puede modificar procesos asignados a su rol o compartidos (BOTH).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      <ChecklistEditor
        items={initialChecklistItems}
        onChange={setChecklistItems}
        disabled={!canModify}
      />

      {/* Campos Estructurados */}
      <ProcesoFields
        procesoNumero={proceso.numero}
        datosIniciales={initialDatos}
        onChange={setDatosEstructurados}
        disabled={!canModify}
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
            disabled={!canModify}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <Button 
              onClick={() => setShowUpload(!showUpload)}
              disabled={!canModify}
            >
              {showUpload ? "Cancelar" : "Subir Archivo"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showUpload && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
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

      {/* Botón de guardado único al final */}
      {canModify && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Guardando..." : "Guardar Todos los Cambios"}
          </Button>
        </div>
      )}
    </div>
  )
}

