"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProcesoStepper } from "@/components/obras/proceso-stepper"
import { ProcesoTabs } from "@/components/obras/proceso-tabs"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
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
  const { data: session } = useSession()
  const router = useRouter()
  const [tabActivo, setTabActivo] = useState("resumen")
  const [eliminando, setEliminando] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  const handleEliminar = async () => {
    if (!confirm(`¿Está seguro de que desea eliminar la obra "${obra.numero} - ${obra.nombre}"?\n\nEsta acción moverá la obra a la papelera.`)) {
      return
    }

    setEliminando(true)
    try {
      const res = await fetch(`/api/obras/${obra.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al eliminar obra")
        return
      }

      router.push("/dashboard/obras")
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar obra:", error)
      alert("Error al eliminar obra")
    } finally {
      setEliminando(false)
    }
  }

  const getEstadoColor = (estado: ObraEstado) => {
    switch (estado) {
      case "FINALIZADA":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
      case "EN_PROCESO":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
      default:
        return "bg-muted text-muted-foreground"
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
          {isAdmin && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="text-xs sm:text-sm"
              onClick={handleEliminar}
              disabled={eliminando}
            >
              <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{eliminando ? "Eliminando..." : "Eliminar"}</span>
            </Button>
          )}
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

