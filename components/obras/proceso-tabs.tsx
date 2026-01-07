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
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-0">
        <div className="flex gap-1 border-b border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all duration-200 relative ${
                tabActivo === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {tabActivo === "resumen" && <ResumenTab obra={obra} />}
        {tabActivo === "procesos" && <ProcesosTab obra={obra} />}
        {tabActivo === "archivos" && <ArchivosTab obraId={obra.id} />}
        {tabActivo === "bitacora" && <BitacoraTab obraId={obra.id} />}
        {tabActivo === "reportes" && <ReportesTab obra={obra} />}
      </CardContent>
    </Card>
  )
}

