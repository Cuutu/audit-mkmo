"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CampoProceso, getCamposProceso } from "@/lib/proceso-fields"
import { UbicacionField } from "./ubicacion-field"

interface ProcesoFieldsProps {
  procesoNumero: number
  datosIniciales: Record<string, any> | null
  onChange?: (datos: Record<string, any>) => void
  disabled?: boolean
}

export function ProcesoFields({
  procesoNumero,
  datosIniciales,
  onChange,
  disabled,
}: ProcesoFieldsProps) {
  const campos = getCamposProceso(procesoNumero)
  const [datos, setDatos] = useState<Record<string, any>>(datosIniciales || {})

  useEffect(() => {
    setDatos(datosIniciales || {})
  }, [datosIniciales])

  const handleChange = (campo: CampoProceso, value: any) => {
    if (disabled) return
    const newDatos = { ...datos, [campo.nombre]: value }
    setDatos(newDatos)
    if (onChange) {
      onChange(newDatos)
    }
  }

  if (campos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay campos estructurados definidos para este proceso.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Datos Estructurados del Proceso</CardTitle>
          <CardDescription>
            Complete los campos específicos de este proceso
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {campos.map((campo) => {
            const valor = datos[campo.nombre] ?? ""

            return (
              <div key={campo.id} className={`space-y-2 ${campo.tipo === "textarea" ? "md:col-span-2" : ""}`}>
                <Label htmlFor={campo.id}>
                  {campo.label}
                  {campo.requerido && <span className="text-red-600 ml-1">*</span>}
                </Label>
                {campo.descripcion && (
                  <p className="text-xs text-muted-foreground -mt-1">{campo.descripcion}</p>
                )}

                {campo.nombre === "ubicacion" || campo.nombre === "ubicacion_texto" ? (
                  <UbicacionField
                    id={campo.id}
                    value={valor}
                    onChange={(value) => handleChange(campo, value)}
                    disabled={disabled}
                    required={campo.requerido}
                  />
                ) : campo.tipo === "text" ? (
                  <Input
                    id={campo.id}
                    value={valor}
                    onChange={(e) => handleChange(campo, e.target.value)}
                    placeholder={campo.placeholder}
                    disabled={disabled}
                    required={campo.requerido}
                  />
                ) : campo.tipo === "number" ? (
                  <Input
                    id={campo.id}
                    type="number"
                    value={valor}
                    onChange={(e) => handleChange(campo, parseFloat(e.target.value) || 0)}
                    placeholder={campo.placeholder}
                    disabled={disabled}
                    required={campo.requerido}
                  />
                ) : campo.tipo === "date" ? (
                  <Input
                    id={campo.id}
                    type="date"
                    value={valor}
                    onChange={(e) => handleChange(campo, e.target.value)}
                    disabled={disabled}
                    required={campo.requerido}
                  />
                ) : campo.tipo === "textarea" ? (
                  <textarea
                    id={campo.id}
                    value={valor}
                    onChange={(e) => handleChange(campo, e.target.value)}
                    placeholder={campo.placeholder}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={disabled}
                    required={campo.requerido}
                  />
                ) : campo.tipo === "select" ? (
                  <select
                    id={campo.id}
                    value={valor}
                    onChange={(e) => handleChange(campo, e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={disabled}
                    required={campo.requerido}
                  >
                    <option value="">Seleccione...</option>
                    {campo.opciones?.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                ) : campo.tipo === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input
                      id={campo.id}
                      type="checkbox"
                      checked={valor === true}
                      onChange={(e) => handleChange(campo, e.target.checked)}
                      disabled={disabled}
                      className="h-4 w-4"
                    />
                    <label htmlFor={campo.id} className="text-sm">
                      {campo.label}
                    </label>
                  </div>
                ) : campo.tipo === "percentage" ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id={campo.id}
                        type="number"
                        min="0"
                        max="100"
                        value={valor}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                          handleChange(campo, val)
                        }}
                        placeholder="0-100"
                        disabled={disabled}
                        required={campo.requerido}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    {typeof valor === 'number' && valor > 0 && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${valor}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

