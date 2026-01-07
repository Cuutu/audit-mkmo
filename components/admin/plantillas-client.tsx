"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { ChecklistEditor, ChecklistItem } from "@/components/procesos/checklist-editor"
import { formatDate } from "@/lib/utils"

interface Plantilla {
  id: string
  procesoNumero: number
  nombre: string
  items: any
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

interface PlantillasClientProps {
  plantillas: Plantilla[]
}

const nombresProcesos: Record<number, string> = {
  1: "Definición técnica de la obra",
  2: "Proyecto / costo proyectado / cronograma",
  3: "Constatación",
  4: "Método de redeterminación",
  5: "Materiales",
  6: "Mano de obra",
  7: "Creación de base de datos",
  8: "Análisis de resultados",
}

export function PlantillasClient({ plantillas: initialPlantillas }: PlantillasClientProps) {
  const router = useRouter()
  const [plantillas, setPlantillas] = useState(initialPlantillas)
  const [showForm, setShowForm] = useState(false)
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    procesoNumero: 1,
    nombre: "",
    items: [] as ChecklistItem[],
    activo: true,
  })

  const handleSubmit = async (items: ChecklistItem[]) => {
    setLoading(true)

    try {
      const url = editingPlantilla
        ? `/api/admin/plantillas/${editingPlantilla.id}`
        : "/api/admin/plantillas"
      const method = editingPlantilla ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procesoNumero: formData.procesoNumero,
          nombre: formData.nombre,
          items,
          activo: formData.activo,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al guardar plantilla")
      }

      router.refresh()
      resetForm()
    } catch (error: any) {
      alert(error.message || "Error al guardar plantilla")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta plantilla?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/plantillas/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al eliminar plantilla")
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al eliminar plantilla")
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const res = await fetch(`/api/admin/plantillas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!res.ok) {
        throw new Error("Error al cambiar estado")
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al cambiar estado")
    }
  }

  const resetForm = () => {
    setFormData({ procesoNumero: 1, nombre: "", items: [], activo: true })
    setEditingPlantilla(null)
    setShowForm(false)
  }

  const startEdit = (plantilla: Plantilla) => {
    setEditingPlantilla(plantilla)
    const items: ChecklistItem[] = Array.isArray(plantilla.items)
      ? (plantilla.items as any[]).map((item: any, index: number) => ({
          id: item.id || index.toString(),
          texto: item.texto || item.text || String(item),
          completado: item.completado || item.completed || false,
          requerido: item.requerido || item.required || false,
        }))
      : []
    setFormData({
      procesoNumero: plantilla.procesoNumero,
      nombre: plantilla.nombre,
      items,
      activo: plantilla.activo,
    })
    setShowForm(true)
  }

  const plantillasPorProceso = plantillas.reduce((acc, plantilla) => {
    if (!acc[plantilla.procesoNumero]) acc[plantilla.procesoNumero] = []
    acc[plantilla.procesoNumero].push(plantilla)
    return acc
  }, {} as Record<number, Plantilla[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Plantillas</h1>
          <p className="text-muted-foreground">
            Gestionar plantillas de checklist por proceso
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancelar" : "Nueva Plantilla"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlantilla ? "Editar Plantilla" : "Nueva Plantilla"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="procesoNumero">Proceso *</Label>
                <select
                  id="procesoNumero"
                  required
                  value={formData.procesoNumero}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      procesoNumero: parseInt(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Proceso {num}: {nombresProcesos[num]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Plantilla *</Label>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Plantilla estándar proceso 1"
                />
              </div>
            </div>
            <ChecklistEditor
              items={formData.items}
              onSave={handleSubmit}
              disabled={loading}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((procesoNum) => (
          <Card key={procesoNum}>
            <CardHeader>
              <CardTitle>
                Proceso {procesoNum}: {nombresProcesos[procesoNum]}
              </CardTitle>
              <CardDescription>
                {plantillasPorProceso[procesoNum]?.length || 0} plantilla(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plantillasPorProceso[procesoNum]?.length > 0 ? (
                <div className="space-y-2">
                  {plantillasPorProceso[procesoNum].map((plantilla) => (
                    <div
                      key={plantilla.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{plantilla.nombre}</p>
                          {plantilla.activo ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Activa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactiva
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(plantilla.items)
                            ? `${plantilla.items.length} item(s)`
                            : "Sin items"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Actualizada: {formatDate(plantilla.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActivo(plantilla.id, plantilla.activo)}
                        >
                          {plantilla.activo ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(plantilla)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plantilla.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay plantillas para este proceso
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

