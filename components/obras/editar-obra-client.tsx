"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Building2, Info } from "lucide-react"
import Link from "next/link"
import { Obra, ObraEstado, PeriodoAuditoria, TipoObraAuditoria } from "@prisma/client"
import { PERIODOS, TIPOS_OBRA_AUDITORIA } from "@/lib/periodos-config"

const obraSchema = z.object({
  numero: z.string().min(1, "El número es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  ano: z.string().regex(/^\d{4}$/, "Año inválido"),
  mes: z.string().regex(/^(0?[1-9]|1[0-2])$/, "Mes inválido (1-12)"),
  observaciones: z.string().optional(),
  estado: z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"]),
})

type ObraFormData = z.infer<typeof obraSchema>

interface EditarObraClientProps {
  obra: Obra
}

export function EditarObraClient({ obra }: EditarObraClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Obtener información del período
  const periodoInfo = obra.periodo ? PERIODOS[obra.periodo as keyof typeof PERIODOS] : null
  const tipoObraInfo = obra.tipoObraAuditoria ? TIPOS_OBRA_AUDITORIA[obra.tipoObraAuditoria as keyof typeof TIPOS_OBRA_AUDITORIA] : null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      numero: obra.numero,
      nombre: obra.nombre,
      ano: obra.ano.toString(),
      mes: obra.mes.toString(),
      observaciones: obra.observaciones || "",
      estado: obra.estado,
    },
  })

  const onSubmit = async (data: ObraFormData) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/obras/${obra.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al actualizar la obra")
      }

      router.push(`/dashboard/obras/${obra.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al actualizar la obra")
    } finally {
      setLoading(false)
    }
  }

  const años = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
  const meses = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/obras/${obra.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Obra</h1>
          <p className="text-muted-foreground">Modificar datos de la obra</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Obra</CardTitle>
          <CardDescription>
            Modifique los datos que desee cambiar. Los procesos no se verán afectados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Información del Período (solo lectura) */}
            {periodoInfo && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-3">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold">Período de Auditoría</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-blue-700">Período</Label>
                    <p className="mt-1 font-medium">{periodoInfo.nombre}</p>
                    <p className="text-sm text-blue-600">{periodoInfo.descripcion}</p>
                  </div>
                  {tipoObraInfo && (
                    <div>
                      <Label className="text-blue-700">Tipo de Obra</Label>
                      <p className="mt-1 font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {tipoObraInfo.nombre}
                      </p>
                      <p className="text-sm text-blue-600">{tipoObraInfo.descripcion}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2 mt-3 text-sm text-blue-600 bg-blue-100 p-2 rounded-md">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>El período y tipo de obra no pueden modificarse una vez creada la obra, ya que esto afectaría los procesos asociados.</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numero">N° Obra *</Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="Ej: OB-2024-001"
                />
                {errors.numero && (
                  <p className="text-sm text-red-600">{errors.numero.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Nombre de la obra"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Año *</Label>
                <select
                  id="ano"
                  {...register("ano")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccione un año</option>
                  {años.map((año) => (
                    <option key={año} value={año.toString()}>
                      {año}
                    </option>
                  ))}
                </select>
                {errors.ano && (
                  <p className="text-sm text-red-600">{errors.ano.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mes">Mes *</Label>
                <select
                  id="mes"
                  {...register("mes")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccione un mes</option>
                  {meses.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
                {errors.mes && (
                  <p className="text-sm text-red-600">{errors.mes.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  {...register("estado")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="NO_INICIADA">No Iniciada</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="FINALIZADA">Finalizada</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <textarea
                id="observaciones"
                {...register("observaciones")}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Link href={`/dashboard/obras/${obra.id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

