"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, FileSpreadsheet, Loader2 } from "lucide-react"

export default function ReportesPage() {
  const [filtros, setFiltros] = useState({
    ano: "",
    mes: "",
    estado: "",
  })
  const [generando, setGenerando] = useState(false)

  const generarReporteGlobal = async (formato: "excel" = "excel") => {
    setGenerando(true)
    try {
      const params = new URLSearchParams()
      if (filtros.ano) params.append("ano", filtros.ano)
      if (filtros.mes) params.append("mes", filtros.mes)
      if (filtros.estado) params.append("estado", filtros.estado)

      const url = `/api/reportes/global?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Error al generar reporte")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `reporte-global-${Date.now()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error al generar reporte:", error)
      alert("Error al generar el reporte. Por favor, intente nuevamente.")
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reportes</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Generar reportes globales y por obra</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reportes por Obra</CardTitle>
            <CardDescription>Generar reportes específicos de una obra</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione una obra desde el listado para generar sus reportes específicos.
              Los reportes incluyen información completa, matriz de control y pueden
              exportarse en PDF o Excel.
            </p>
            <Button asChild>
              <a href="/dashboard/obras">Ir a Obras</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes Globales</CardTitle>
            <CardDescription>Reportes consolidados del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ano">Año</Label>
                  <Input
                    id="ano"
                    type="number"
                    placeholder="Ej: 2024"
                    value={filtros.ano}
                    onChange={(e) =>
                      setFiltros({ ...filtros, ano: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mes">Mes (1-12 o rango: 2-12)</Label>
                  <Input
                    id="mes"
                    type="text"
                    placeholder="Ej: 2-12 o 5"
                    value={filtros.mes}
                    onChange={(e) =>
                      setFiltros({ ...filtros, mes: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Deje vacío para todos los meses del año
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <select
                    id="estado"
                    value={filtros.estado}
                    onChange={(e) =>
                      setFiltros({ ...filtros, estado: e.target.value })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="NO_INICIADA">No Iniciada</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => generarReporteGlobal("excel")}
                  disabled={generando}
                  className="flex-1"
                >
                  {generando ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                  )}
                  Generar Excel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                El reporte incluirá todas las obras que coincidan con los filtros
                seleccionados. Deje los campos vacíos para incluir todas las obras.
                <br />
                <strong>Ejemplos de filtro de mes:</strong> &quot;5&quot; (solo mayo), &quot;2-12&quot; (febrero a diciembre), vacío (todos los meses).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Reportes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Reportes por Obra:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Reporte Completo:</strong> Información detallada, procesos y archivos</li>
                <li>• <strong>Matriz de Control:</strong> Tabla de procesos vs responsables</li>
                <li>• <strong>Exportación:</strong> PDF o Excel</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Reportes Globales:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Por mes/año:</strong> Filtro por período específico</li>
                <li>• <strong>Por estado:</strong> Obras según su estado actual</li>
                <li>• <strong>Consolidado:</strong> Todas las obras con resumen</li>
                <li>• <strong>Exportación:</strong> Excel con múltiples hojas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
