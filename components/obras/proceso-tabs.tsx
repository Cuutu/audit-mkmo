"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Obra, Proceso, User } from "@prisma/client"
import { ResumenTab } from "./tabs/resumen-tab"
import { ProcesosTab } from "./tabs/procesos-tab"
import { ArchivosTab } from "./tabs/archivos-tab"
import { BitacoraTab } from "./tabs/bitacora-tab"
import { ReportesTab } from "./tabs/reportes-tab"

type ObraWithRelations = Obra & {
  procesos: (Proceso & {
    responsableUser: { name: string } | null
  })[]
  createdBy: {
    name: string
    email?: string
  }
}

interface ProcesoTabsProps {
  obra: ObraWithRelations
  tabActivo: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "resumen", label: "Resumen" },
  { id: "procesos", label: "Procesos" },
  { id: "archivos", label: "Archivos" },
  { id: "bitacora", label: "Bitácora" },
  { id: "reportes", label: "Reportes" },
]

export function ProcesoTabs({ obra, tabActivo, onTabChange }: ProcesoTabsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                tabActivo === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {tabActivo === "resumen" && <ResumenTab obra={obra} />}
        {tabActivo === "procesos" && <ProcesosTab obra={obra} />}
        {tabActivo === "archivos" && <ArchivosTab obraId={obra.id} />}
        {tabActivo === "bitacora" && <BitacoraTab obraId={obra.id} />}
        {tabActivo === "reportes" && <ReportesTab obra={obra} />}
      </CardContent>
    </Card>
  )
}

