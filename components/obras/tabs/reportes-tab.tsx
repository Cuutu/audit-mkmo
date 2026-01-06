"use client"

import { useState } from "react"
import { Obra, Proceso, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { FileText, Download, FileSpreadsheet, Loader2 } from "lucide-react"

type ObraWithRelations = Obra & {
  procesos: (Proceso & {
    responsableUser: { name: string } | null
  })[]
  createdBy: {
    name: string
    email?: string
  }
}

interface ReportesTabProps {
  obra: ObraWithRelations
}

export function ReportesTab({ obra }: ReportesTabProps) {
  const [generando, setGenerando] = useState<string | null>(null)

  const generarReporte = async (tipo: string, formato: "pdf" | "excel" = "pdf") => {
    setGenerando(`${tipo}-${formato}`)
    try {
      const url = `/api/obras/${obra.id}/reporte?tipo=${tipo}&formato=${formato}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Error al generar reporte")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `reporte-obra-${obra.numero}-${tipo}.${formato === "pdf" ? "pdf" : "xlsx"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error al generar reporte:", error)
      alert("Error al generar el reporte. Por favor, intente nuevamente.")
    } finally {
      setGenerando(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Reportes Disponibles</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Reporte Completo</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Reporte completo con todos los datos de la obra y procesos
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => generarReporte("completo", "pdf")}
              className="flex-1"
              disabled={generando === "completo-pdf"}
            >
              {generando === "completo-pdf" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
            <Button
              onClick={() => generarReporte("completo", "excel")}
              variant="outline"
              className="flex-1"
              disabled={generando === "completo-excel"}
            >
              {generando === "completo-excel" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Excel
            </Button>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Diagrama de Flujo</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Visualización del flujo de procesos
          </p>
          <Button
            onClick={() => generarReporte("completo", "pdf")}
            className="w-full"
            disabled={generando === "completo-pdf"}
          >
            {generando === "completo-pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Generar PDF
          </Button>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Matriz de Control</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Matriz de control de procesos y responsables
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => generarReporte("matriz", "pdf")}
              className="flex-1"
              disabled={generando === "matriz-pdf"}
            >
              {generando === "matriz-pdf" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
            <Button
              onClick={() => generarReporte("matriz", "excel")}
              variant="outline"
              className="flex-1"
              disabled={generando === "matriz-excel"}
            >
              {generando === "matriz-excel" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Excel
            </Button>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Gráficos y Cuadros</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Análisis gráfico de avances y estadísticas
          </p>
          <Button
            onClick={() => generarReporte("completo", "pdf")}
            className="w-full"
            disabled={generando === "completo-pdf"}
          >
            {generando === "completo-pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Generar PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

