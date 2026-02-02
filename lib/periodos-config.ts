// Configuración de períodos de auditoría y procesos asociados

import { ResponsableTipo } from "@prisma/client"

// Definición de períodos
export const PERIODOS = {
  PERIODO_2022_2023: {
    id: "PERIODO_2022_2023",
    nombre: "Período 2022-2023",
    descripcion: "1 de Junio 2022 - 31 de Mayo 2023",
    fechaInicio: new Date("2022-06-01"),
    fechaFin: new Date("2023-05-31"),
    procesos: [1, 2, 3, 4, 5, 6, 7, 8],
    requiereTipoObra: false,
  },
  PERIODO_2023_2024: {
    id: "PERIODO_2023_2024",
    nombre: "Período 2023-2024",
    descripcion: "1 de Junio 2023 - 31 de Mayo 2024",
    fechaInicio: new Date("2023-06-01"),
    fechaFin: new Date("2024-05-31"),
    procesos: [9, 10, 11, 12, 13, 14, 15, 16],
    requiereTipoObra: true,
  },
  PERIODO_2024_2025: {
    id: "PERIODO_2024_2025",
    nombre: "Período 2024-2025",
    descripcion: "1 de Junio 2024 - 31 de Mayo 2025",
    fechaInicio: new Date("2024-06-01"),
    fechaFin: new Date("2025-05-31"),
    procesos: [9, 10, 11, 12, 13, 14, 15, 16],
    requiereTipoObra: true,
  },
} as const

export type PeriodoId = keyof typeof PERIODOS

// Definición de tipos de obra para períodos 2023-2024 y 2024-2025
export const TIPOS_OBRA_AUDITORIA = {
  TERMINADA: {
    id: "TERMINADA",
    nombre: "Obra Terminada",
    descripcion: "Obras finalizadas en el período",
    procesos: [9, 10, 11, 12], // Procesos específicos para obras terminadas
  },
  EN_EJECUCION: {
    id: "EN_EJECUCION",
    nombre: "Obra en Ejecución",
    descripcion: "Obras en curso durante el período",
    procesos: [13, 14, 15, 16], // Procesos específicos para obras en ejecución
  },
} as const

export type TipoObraAuditoriaId = keyof typeof TIPOS_OBRA_AUDITORIA

// Procesos 1-8 (Período 2022-2023) - Procesos originales
export const PROCESOS_PERIODO_1 = [
  { numero: 1, nombre: "Definición técnica de la obra", responsable: "ENGINEER" as ResponsableTipo },
  { numero: 2, nombre: "Proyecto / costo proyectado / cronograma", responsable: "ENGINEER" as ResponsableTipo },
  { numero: 3, nombre: "Constatación (planos / revisiones / registro fotográfico)", responsable: "ENGINEER" as ResponsableTipo },
  { numero: 4, nombre: "Método de redeterminación / desglose económico", responsable: "ACCOUNTANT" as ResponsableTipo },
  { numero: 5, nombre: "Materiales involucrados", responsable: "BOTH" as ResponsableTipo },
  { numero: 6, nombre: "Mano de obra involucrada", responsable: "ACCOUNTANT" as ResponsableTipo },
  { numero: 7, nombre: "Creación de base de datos", responsable: "BOTH" as ResponsableTipo },
  { numero: 8, nombre: "Análisis de resultados", responsable: "BOTH" as ResponsableTipo },
]

// Procesos 9-12 (Obras Terminadas - Períodos 2023-2024 y 2024-2025)
export const PROCESOS_OBRAS_TERMINADAS = [
  { 
    numero: 9, 
    nombre: "Documentación Ejecutiva de la Obra (Terminada)", 
    responsable: "ENGINEER" as ResponsableTipo,
    objetivo: "Identificar dentro del Plan de Mejoras y Ampliación u otro; verificar fecha de inicio.",
    evidencia: "Documentación probatoria con identificación del responsable.",
  },
  { 
    numero: 10, 
    nombre: "Presupuesto Inicial, Prorrateo en Materiales y Mano de Obra", 
    responsable: "ACCOUNTANT" as ResponsableTipo,
    objetivo: "Discriminación del gasto; fecha de inicio y finalización.",
    evidencia: "Documentación probatoria con identificación del responsable.",
  },
  { 
    numero: 11, 
    nombre: "Planos y Descripción Técnica de la finalidad de las Obras", 
    responsable: "ENGINEER" as ResponsableTipo,
    objetivo: "Registrar modificaciones y revisiones; conformar archivo y registro de obras.",
    evidencia: "Documentación probatoria con identificación del responsable.",
  },
  { 
    numero: 12, 
    nombre: "Ubicación física de las obras (Terminada)", 
    responsable: "ENGINEER" as ResponsableTipo,
    objetivo: "Detalle de ubicación o geolocalización de la obra.",
    evidencia: "Registro fotográfico de obras.",
  },
]

// Procesos 13-16 (Obras en Ejecución - Períodos 2023-2024 y 2024-2025)
export const PROCESOS_OBRAS_EN_EJECUCION = [
  { 
    numero: 13, 
    nombre: "Documentación Ejecutiva de la Obra (En Ejecución)", 
    responsable: "ENGINEER" as ResponsableTipo,
    objetivo: "Identificar dentro del Plan de Mejoras y Ampliación u otro; verificar fecha de inicio.",
    evidencia: "Documentación probatoria con identificación del responsable.",
  },
  { 
    numero: 14, 
    nombre: "Planos y Datos Técnicos de la finalidad de las Obras", 
    responsable: "ENGINEER" as ResponsableTipo,
    objetivo: "Conformar archivo y registro de obras.",
    evidencia: "Documentación probatoria con identificación del responsable.",
  },
  { 
    numero: 15, 
    nombre: "Presupuesto Inicial, Avance porcentual de la Obra", 
    responsable: "ACCOUNTANT" as ResponsableTipo,
    objetivo: "Constatar el avance de la ejecución en el período.",
    evidencia: "Documentación probatoria con identificación del responsable.",
  },
  { 
    numero: 16, 
    nombre: "Ubicación física de las obras (En Ejecución)", 
    responsable: "ENGINEER" as ResponsableTipo,
    objetivo: "Detalle de ubicación o geolocalización.",
    evidencia: "Demarcación planimétrica de distribución de obras.",
  },
]

// Función para obtener los procesos según el período y tipo de obra
export function getProcesosParaObra(
  periodo: PeriodoId, 
  tipoObraAuditoria?: TipoObraAuditoriaId
): typeof PROCESOS_PERIODO_1 | typeof PROCESOS_OBRAS_TERMINADAS | typeof PROCESOS_OBRAS_EN_EJECUCION {
  if (periodo === "PERIODO_2022_2023") {
    return PROCESOS_PERIODO_1
  }
  
  // Para períodos 2023-2024 y 2024-2025
  if (tipoObraAuditoria === "TERMINADA") {
    return PROCESOS_OBRAS_TERMINADAS
  }
  
  return PROCESOS_OBRAS_EN_EJECUCION
}

// Función para verificar si un período requiere tipo de obra
export function periodoRequiereTipoObra(periodo: PeriodoId): boolean {
  return PERIODOS[periodo]?.requiereTipoObra ?? false
}

// Función para obtener info del período
export function getPeriodoInfo(periodo: PeriodoId) {
  return PERIODOS[periodo]
}

// Lista de opciones para el selector de períodos
export const PERIODOS_OPTIONS = Object.values(PERIODOS).map(p => ({
  value: p.id,
  label: p.nombre,
  descripcion: p.descripcion,
}))

// Lista de opciones para el selector de tipo de obra
export const TIPOS_OBRA_OPTIONS = Object.values(TIPOS_OBRA_AUDITORIA).map(t => ({
  value: t.id,
  label: t.nombre,
  descripcion: t.descripcion,
}))
