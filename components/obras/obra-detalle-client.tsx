"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProcesoStepper } from "@/components/obras/proceso-stepper"
import { ProcesoTabs } from "@/components/obras/proceso-tabs"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { Obra, Proceso, User, ObraEstado } from "@prisma/client"

type ObraWithRelations = Obra & {
  procesos: (Proceso & {
    responsableUser: { name: string } | null
  })[]
  createdBy: {
    name: string
    email?: string
  }
}

interface ObraDetalleClientProps {
  obra: ObraWithRelations
}

export function ObraDetalleClient({ obra }: ObraDetalleClientProps) {
  const [tabActivo, setTabActivo] = useState("resumen")

  const getEstadoColor = (estado: ObraEstado) => {
    switch (estado) {
      case "FINALIZADA":
        return "bg-green-100 text-green-800"
      case "EN_PROCESO":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <Link href="/dashboard/obras" className="flex-shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">
              {obra.numero} - {obra.nombre}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {meses[obra.mes - 1]} {obra.ano} • Creada por {obra.createdBy.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getEstadoColor(obra.estado)}`}
          >
            {obra.estado.replace("_", " ")}
          </span>
          <Link href={`/dashboard/obras/${obra.id}/editar`}>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper de Procesos */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Procesos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcesoStepper procesos={obra.procesos} obraId={obra.id} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <ProcesoTabs
        obra={obra}
        tabActivo={tabActivo}
        onTabChange={setTabActivo}
      />
    </div>
  )
}

