"use client"

import { ResponsableTipo, ProcesoEstado } from "@prisma/client"
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Proceso {
  id: string
  numero: number
  nombre: string
  estado: ProcesoEstado
  responsable: ResponsableTipo
  avance: number
}

interface ProcesoStepperProps {
  procesos: Proceso[]
  obraId: string
}

export function ProcesoStepper({ procesos, obraId }: ProcesoStepperProps) {
  const getResponsableColor = (responsable: ResponsableTipo) => {
    switch (responsable) {
      case "ENGINEER":
        return "bg-red-500"
      case "ACCOUNTANT":
        return "bg-gray-900"
      case "BOTH":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  const getEstadoIcon = (estado: ProcesoEstado) => {
    switch (estado) {
      case "APROBADO":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "EN_REVISION":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "EN_CURSO":
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getEstadoLabel = (estado: ProcesoEstado) => {
    switch (estado) {
      case "APROBADO":
        return "Aprobado"
      case "EN_REVISION":
        return "En Revisión"
      case "EN_CURSO":
        return "En Curso"
      default:
        return "No Iniciado"
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {procesos.map((proceso, index) => (
          <Link
            key={proceso.id}
            href={`/dashboard/obras/${obraId}/procesos/${proceso.numero}`}
            className="block"
          >
            <div
              className={cn(
                "p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer",
                proceso.estado !== "NO_INICIADO" && "border-primary"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      getResponsableColor(proceso.responsable)
                    )}
                    title={
                      proceso.responsable === "ENGINEER"
                        ? "Ingeniero"
                        : proceso.responsable === "ACCOUNTANT"
                        ? "Contador"
                        : "Ambos"
                    }
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    Proceso {proceso.numero}
                  </span>
                </div>
                {getEstadoIcon(proceso.estado)}
              </div>
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                {proceso.nombre}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{getEstadoLabel(proceso.estado)}</span>
                <span>{proceso.avance}%</span>
              </div>
              {proceso.avance > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${proceso.avance}%` }}
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

