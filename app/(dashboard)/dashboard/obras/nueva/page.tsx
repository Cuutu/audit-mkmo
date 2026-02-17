"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Info, Calendar, Building2 } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/ui/file-upload"
import { PERIODOS_OPTIONS, TIPOS_OBRA_OPTIONS, periodoRequiereTipoObra, getPeriodoInfo, PERIODOS, getDescripcionProcesosPeriodo, getAñosParaPeriodo, getMesesParaPeriodoYAno } from "@/lib/periodos-config"

const obraSchema = z.object({
  numero: z.string().min(1, "El número es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  ano: z.string().regex(/^\d{4}$/, "Año inválido"),
  mes: z.string().regex(/^(0?[1-9]|1[0-2])$/, "Mes inválido (1-12)"),
  observaciones: z.string().optional(),
  estado: z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"]).default("NO_INICIADA"),
  periodo: z.enum(["PERIODO_2022_2023", "PERIODO_2023_2024", "PERIODO_2024_2025"]),
  tipoObraAuditoria: z.enum(["TERMINADA", "EN_EJECUCION"]).optional(),
}).refine((data) => {
  // Validar que el período esté habilitado
  if (data.periodo === "PERIODO_2024_2025") {
    return false
  }
  return true
}, {
  message: "Este período aún no está disponible",
  path: ["periodo"],
}).refine((data) => {
  // Si el período requiere tipo de obra, debe estar presente
  if (periodoRequiereTipoObra(data.periodo) && !data.tipoObraAuditoria) {
    return false
  }
  return true
}, {
  message: "El tipo de obra es requerido para este período",
  path: ["tipoObraAuditoria"],
})

type ObraFormData = z.infer<typeof obraSchema>

export default function NuevaObraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [caratulaFile, setCaratulaFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      estado: "NO_INICIADA",
      periodo: "PERIODO_2022_2023",
    },
  })

  const selectedPeriodo = watch("periodo")
  const selectedAno = watch("ano")
  const selectedMes = watch("mes")
  const requiereTipoObra = periodoRequiereTipoObra(selectedPeriodo)

  // Años y meses desde configuración (sin hardcodear)
  const añosDisponibles = getAñosParaPeriodo(selectedPeriodo as keyof typeof PERIODOS)
  const mesesDisponibles = getMesesParaPeriodoYAno(
    selectedPeriodo as keyof typeof PERIODOS,
    selectedAno ? parseInt(selectedAno) : 0
  )

  // Limpiar tipoObraAuditoria, año y mes si se cambia el período o el año
  useEffect(() => {
    if (!requiereTipoObra) {
      setValue("tipoObraAuditoria", undefined)
    }
    if (selectedAno && !añosDisponibles.includes(parseInt(selectedAno))) {
      setValue("ano", "")
    }
    if (selectedMes && mesesDisponibles.length > 0 && !mesesDisponibles.includes(parseInt(selectedMes))) {
      setValue("mes", "")
    }
  }, [requiereTipoObra, setValue, selectedPeriodo, añosDisponibles, selectedAno, selectedMes, mesesDisponibles])

  const onSubmit = async (data: ObraFormData) => {
    setLoading(true)
    setError("")

    try {
      // Crear la obra primero
      const res = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al crear la obra")
      }

      const obra = await res.json()

      // Si hay carátula, subirla
      if (caratulaFile) {
        try {
          const formData = new FormData()
          formData.append("file", caratulaFile)

          const uploadRes = await fetch(`/api/obras/${obra.id}/archivos/upload`, {
            method: "POST",
            body: formData,
          })

          if (!uploadRes.ok) {
            console.warn("La obra se creó pero hubo un error al subir la carátula")
          }
        } catch (uploadError) {
          console.warn("Error al subir carátula:", uploadError)
          // No fallar la creación de la obra si falla la carátula
        }
      }

      router.push(`/dashboard/obras/${obra.id}`)
    } catch (err: any) {
      setError(err.message || "Error al crear la obra")
    } finally {
      setLoading(false)
    }
  }

  const handleCaratulaUpload = async (file: File) => {
    setCaratulaFile(file)
  }

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
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/dashboard/obras" className="flex-shrink-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Nueva Obra</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Crear una nueva obra en el sistema</p>
        </div>
      </div>

      <Card className="border-0 shadow-soft bg-card/95 dark:bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Datos de la Obra</CardTitle>
          <CardDescription>
            Complete los datos básicos de la obra. Los procesos se crearán automáticamente según el período seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-md">
                {error}
              </div>
            )}

            {/* Sección de Período de Control */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Calendar className="h-5 w-5" />
                <h3 className="font-semibold">Período de Control</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Seleccionar Período *</Label>
                  <select
                    id="periodo"
                    {...register("periodo")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {PERIODOS_OPTIONS.map((periodo) => {
                      const periodoData = PERIODOS[periodo.value as keyof typeof PERIODOS]
                      const habilitado = periodoData?.habilitado !== false
                      return (
                        <option 
                          key={periodo.value} 
                          value={periodo.value}
                          disabled={!habilitado}
                        >
                          {periodo.label} ({periodo.descripcion}){!habilitado ? " - Próximamente" : ""}
                        </option>
                      )
                    })}
                  </select>
                  {errors.periodo && (
                    <p className="text-sm text-red-600">{errors.periodo.message}</p>
                  )}
                </div>

                {requiereTipoObra && (
                  <div className="space-y-2">
                    <Label htmlFor="tipoObraAuditoria">Tipo de Obra (Auditoría) *</Label>
                    <select
                      id="tipoObraAuditoria"
                      {...register("tipoObraAuditoria")}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccione tipo de obra</option>
                      {TIPOS_OBRA_OPTIONS.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    {errors.tipoObraAuditoria && (
                      <p className="text-sm text-red-600">{errors.tipoObraAuditoria.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Info del período seleccionado (desde configuración) */}
              <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 p-3 rounded-md">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{getDescripcionProcesosPeriodo(selectedPeriodo as keyof typeof PERIODOS) || "Este período estará disponible próximamente."}</p>
                </div>
              </div>
            </div>

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
                  {añosDisponibles.map((año) => (
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
                  disabled={!selectedAno}
                >
                  <option value="">
                    {selectedAno
                      ? "Seleccione un mes"
                      : "Seleccione primero un año"}
                  </option>
                  {meses
                    .filter((mes) => mesesDisponibles.includes(parseInt(mes.value)))
                    .map((mes) => (
                      <option key={mes.value} value={mes.value}>
                        {mes.label}
                      </option>
                    ))}
                </select>
                {selectedAno && mesesDisponibles.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {mesesDisponibles.length === 5
                      ? "Enero a mayo (cierre del período)"
                      : "Junio a diciembre (inicio del período)"}
                  </p>
                )}
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

            <div className="space-y-2">
              <Label>Carátula o Documentación Inicial (Opcional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Puede adjuntar la carátula o documentación inicial. Se subirá automáticamente después de crear la obra.
              </p>
              <FileUpload
                onUpload={handleCaratulaUpload}
                disabled={loading}
              />
              {caratulaFile && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Archivo seleccionado: {caratulaFile.name} ({(caratulaFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Creando..." : "Crear Obra"}
              </Button>
              <Link href="/dashboard/obras" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
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

