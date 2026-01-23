"use client"

import { memo } from "react"
import { ResponsableTipo, ProcesoEstado } from "@prisma/client"
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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

export const ProcesoStepper = memo(function ProcesoStepper({ procesos, obraId }: ProcesoStepperProps) {
  const getResponsableColor = (responsable: ResponsableTipo) => {
    switch (responsable) {
      case "ENGINEER":
        return "bg-red-500"
      case "ACCOUNTANT":
        return "bg-green-500"
      case "BOTH":
        return "bg-yellow-500"
      default:
        return "bg-muted"
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
                return <Circle className="h-5 w-5 text-muted-foreground" />
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
          <motion.div
            key={proceso.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/dashboard/obras/${obraId}/procesos/${proceso.numero}`}
              className="block group"
            >
              <div
                className={cn(
                  "p-5 border rounded-xl hover:shadow-medium transition-all duration-200 cursor-pointer bg-card",
                  proceso.estado !== "NO_INICIADO" 
                    ? "border-primary/30 bg-primary/5 hover:border-primary/50" 
                    : "border-border/50 hover:border-border hover:bg-accent/30"
                )}
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-sm",
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
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Proceso {proceso.numero}
                  </span>
                </div>
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {getEstadoIcon(proceso.estado)}
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {proceso.nombre}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{getEstadoLabel(proceso.estado)}</span>
                <span className="font-semibold">{proceso.avance}%</span>
              </div>
              {proceso.avance > 0 && (
                <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${proceso.avance}%` }}
                  />
                </div>
              )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
})

