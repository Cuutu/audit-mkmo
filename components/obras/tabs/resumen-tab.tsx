"use client"

import { Obra, Proceso, User } from "@prisma/client"
import { formatDate } from "@/lib/utils"

type ObraWithRelations = Obra & {
  procesos: (Proceso & {
    responsableUser: { name: string } | null
  })[]
  createdBy: {
    name: string
    email?: string
  }
}

interface ResumenTabProps {
  obra: ObraWithRelations
}

export function ResumenTab({ obra }: ResumenTabProps) {
  const procesosCompletados = obra.procesos.filter(
    (p) => p.estado === "APROBADO"
  ).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-2">Información General</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Número:</dt>
              <dd className="font-medium">{obra.numero}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre:</dt>
              <dd className="font-medium">{obra.nombre}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Año/Mes:</dt>
              <dd className="font-medium">
                {obra.mes}/{obra.ano}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estado:</dt>
              <dd className="font-medium">{obra.estado.replace("_", " ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Avance General:</dt>
              <dd className="font-medium">{obra.avance}%</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Estadísticas</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Procesos Completados:</dt>
              <dd className="font-medium">
                {procesosCompletados} / {obra.procesos.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Creada:</dt>
              <dd className="font-medium">{formatDate(obra.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Última Actualización:</dt>
              <dd className="font-medium">{formatDate(obra.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Creada por:</dt>
              <dd className="font-medium">{obra.createdBy.name}</dd>
            </div>
          </dl>
        </div>
      </div>

      {obra.observaciones && (
        <div>
          <h3 className="font-semibold mb-2">Observaciones</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {obra.observaciones}
          </p>
        </div>
      )}
    </div>
  )
}

