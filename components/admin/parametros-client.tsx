"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Parametro {
  id: string
  clave: string
  valor: string
  tipo: string
  descripcion: string | null
  categoria: string | null
  createdAt: Date
  updatedAt: Date
}

interface ParametrosClientProps {
  parametros: Parametro[]
}

export function ParametrosClient({ parametros: initialParametros }: ParametrosClientProps) {
  const router = useRouter()
  const [parametros, setParametros] = useState(initialParametros)
  const [showForm, setShowForm] = useState(false)
  const [editingParametro, setEditingParametro] = useState<Parametro | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clave: "",
    valor: "",
    tipo: "string",
    descripcion: "",
    categoria: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingParametro
        ? `/api/admin/parametros/${editingParametro.id}`
        : "/api/admin/parametros"
      const method = editingParametro ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al guardar parámetro")
      }

      router.refresh()
      resetForm()
    } catch (error: any) {
      alert(error.message || "Error al guardar parámetro")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este parámetro?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/parametros/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al eliminar parámetro")
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al eliminar parámetro")
    }
  }

  const resetForm = () => {
    setFormData({ clave: "", valor: "", tipo: "string", descripcion: "", categoria: "" })
    setEditingParametro(null)
    setShowForm(false)
  }

  const startEdit = (parametro: Parametro) => {
    setEditingParametro(parametro)
    setFormData({
      clave: parametro.clave,
      valor: parametro.valor,
      tipo: parametro.tipo,
      descripcion: parametro.descripcion || "",
      categoria: parametro.categoria || "",
    })
    setShowForm(true)
  }

  const categorias = ["obra", "proceso", "reporte", "sistema", "otro"]
  const tipos = ["string", "number", "boolean", "json"]

  const parametrosPorCategoria = parametros.reduce((acc, param) => {
    const cat = param.categoria || "Sin categoría"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(param)
    return acc
  }, {} as Record<string, Parametro[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Parámetros</h1>
          <p className="text-muted-foreground">
            Configurar parámetros y catálogos del sistema
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancelar" : "Nuevo Parámetro"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingParametro ? "Editar Parámetro" : "Nuevo Parámetro"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clave">Clave *</Label>
                  <Input
                    id="clave"
                    required
                    value={formData.clave}
                    onChange={(e) =>
                      setFormData({ ...formData, clave: e.target.value })
                    }
                    disabled={!!editingParametro}
                    placeholder="ej: max_archivos_obra"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <select
                    id="tipo"
                    required
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {tipos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    required
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    placeholder="Valor del parámetro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Descripción del parámetro..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(parametrosPorCategoria).map(([categoria, params]) => (
          <Card key={categoria}>
            <CardHeader>
              <CardTitle>{categoria}</CardTitle>
              <CardDescription>{params.length} parámetro(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {params.map((parametro) => (
                  <div
                    key={parametro.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{parametro.clave}</p>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                          {parametro.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Valor: <strong>{parametro.valor}</strong>
                      </p>
                      {parametro.descripcion && (
                        <p className="text-xs text-muted-foreground">
                          {parametro.descripcion}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Actualizado: {formatDate(parametro.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(parametro)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(parametro.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

