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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/ui/file-upload"

const obraSchema = z.object({
  numero: z.string().min(1, "El número es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  ano: z.string().regex(/^\d{4}$/, "Año inválido"),
  mes: z.string().regex(/^(0?[1-9]|1[0-2])$/, "Mes inválido (1-12)"),
  observaciones: z.string().optional(),
  estado: z.enum(["NO_INICIADA", "EN_PROCESO", "FINALIZADA"]).default("NO_INICIADA"),
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
  } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      estado: "NO_INICIADA",
    },
  })

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

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Obra</CardTitle>
          <CardDescription>
            Complete los datos básicos de la obra. Los 8 procesos se crearán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
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

