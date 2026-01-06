"use client"

import { Obra, Proceso, User } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

type ObraWithRelations = Obra & {
  procesos: (Proceso & {
    responsableUser: { name: string } | null
  })[]
  createdBy: {
    name: string
    email?: string
  }
}

interface ProcesosTabProps {
  obra: ObraWithRelations
}

export function ProcesosTab({ obra }: ProcesosTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {obra.procesos.map((proceso) => (
          <div
            key={proceso.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">
                  Proceso {proceso.numero}: {proceso.nombre}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Responsable:{" "}
                  {proceso.responsable === "ENGINEER"
                    ? "Ingeniero"
                    : proceso.responsable === "ACCOUNTANT"
                    ? "Contador"
                    : "Ambos"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">{proceso.estado.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avance</p>
                <p className="font-medium">{proceso.avance}%</p>
              </div>
              <Link href={`/dashboard/obras/${obra.id}/procesos/${proceso.numero}`}>
                <Button variant="outline" size="sm">
                  Ver Detalle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

