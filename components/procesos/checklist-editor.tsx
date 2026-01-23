"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface ChecklistItem {
  id: string
  texto: string
  completado: boolean
  requerido: boolean
}

interface ChecklistEditorProps {
  items: ChecklistItem[]
  onChange?: (items: ChecklistItem[]) => void
  disabled?: boolean
}

export function ChecklistEditor({ items: initialItems, onChange, disabled }: ChecklistEditorProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems || [])
  const [newItemText, setNewItemText] = useState("")

  useEffect(() => {
    setItems(initialItems || [])
  }, [initialItems])

  const updateItems = (newItems: ChecklistItem[]) => {
    setItems(newItems)
    if (onChange) {
      onChange(newItems)
    }
  }

  const handleToggle = (id: string) => {
    if (disabled) return
    updateItems(items.map(item =>
      item.id === id ? { ...item, completado: !item.completado } : item
    ))
  }

  const handleAdd = () => {
    if (!newItemText.trim() || disabled) return
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      texto: newItemText.trim(),
      completado: false,
      requerido: false,
    }
    
    updateItems([...items, newItem])
    setNewItemText("")
  }

  const handleDelete = (id: string) => {
    if (disabled) return
    updateItems(items.filter(item => item.id !== id))
  }

  const handleToggleRequerido = (id: string) => {
    if (disabled) return
    updateItems(items.map(item =>
      item.id === id ? { ...item, requerido: !item.requerido } : item
    ))
  }

  const completados = items.filter(item => item.completado).length
  const total = items.length
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Checklist de Requeridos</CardTitle>
          <CardDescription>
            {total > 0 && (
              <span>
                {completados} de {total} completados ({porcentaje}%)
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progreso */}
        {total > 0 && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        )}

        {/* Lista de items */}
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 border rounded-lg ${
                item.completado ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-card"
              }`}
            >
              <button
                onClick={() => handleToggle(item.id)}
                disabled={disabled}
                className="flex-shrink-0"
              >
                {item.completado ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    item.completado ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {item.texto}
                </p>
                {item.requerido && (
                  <span className="text-xs text-red-600 font-medium">Requerido</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRequerido(item.id)}
                  disabled={disabled}
                  className={`text-xs px-2 py-1 rounded ${
                    item.requerido
                      ? "bg-red-100 text-red-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.requerido ? "Requerido" : "Opcional"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agregar nuevo item */}
        {!disabled && (
          <div className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAdd()
                }
              }}
              placeholder="Agregar nuevo item al checklist..."
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={!newItemText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay items en el checklist. Agrega el primero arriba.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

