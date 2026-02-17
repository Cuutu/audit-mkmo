// Definición de campos estructurados por proceso
// Fuente de verdad: Programa de Control y Verificación del Fideicomiso

export interface CampoProceso {
  id: string
  nombre: string
  tipo: "text" | "number" | "date" | "textarea" | "select" | "checkbox" | "file" | "percentage"
  label: string
  placeholder?: string
  requerido?: boolean
  opciones?: string[]
  valor?: any
  descripcion?: string
  acceptedFiles?: string
}

// Estructura de campos por proceso (1-16)
// 1-12: Período 2022-2023 | 9-16: Período 2023-2024 (9-12 y 13-16)
export const camposPorProceso: Record<number, CampoProceso[]> = {
  // ============================================================
  // PROCESOS 1-4: CONTABLES (Período 2022-2023)
  // ============================================================
  1: [
    {
      id: "recaudacion_mensual",
      nombre: "recaudacion_mensual",
      tipo: "number",
      label: "Recaudación Mensual ($)",
      descripcion: "Rendición mensual del período",
      requerido: true,
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
    {
      id: "notas",
      nombre: "notas",
      tipo: "textarea",
      label: "Notas",
    },
  ],
  2: [
    {
      id: "balance_verificado",
      nombre: "balance_verificado",
      tipo: "checkbox",
      label: "Coincidencia con balance del fideicomiso",
    },
    {
      id: "movimientos_periodo",
      nombre: "movimientos_periodo",
      tipo: "textarea",
      label: "Movimientos del Período",
      descripcion: "Resumen de movimientos verificados",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],
  3: [
    {
      id: "gastos_rendidos",
      nombre: "gastos_rendidos",
      tipo: "number",
      label: "Gastos Rendidos ($)",
      descripcion: "Costos de obras terminadas",
      requerido: true,
    },
    {
      id: "detalle_costos",
      nombre: "detalle_costos",
      tipo: "textarea",
      label: "Detalle de Costos",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],
  4: [
    {
      id: "gasto_mensual_ejecucion",
      nombre: "gasto_mensual_ejecucion",
      tipo: "number",
      label: "Gasto Mensual en Ejecución ($)",
      requerido: true,
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
    {
      id: "notas",
      nombre: "notas",
      tipo: "textarea",
      label: "Notas",
    },
  ],

  // ============================================================
  // PROCESOS 5-8: TÉCNICOS OBRAS FINALIZADAS (Período 2022-2023)
  // ============================================================
  5: [
    {
      id: "plan_referencia",
      nombre: "plan_referencia",
      tipo: "textarea",
      label: "Plan de Mejoras y Ampliación (u otro)",
      descripcion: "Verificar plan de mejoras y ampliación",
      requerido: true,
    },
    {
      id: "fecha_inicio_verificada",
      nombre: "fecha_inicio_verificada",
      tipo: "date",
      label: "Fecha de Inicio Verificada",
      requerido: true,
    },
    {
      id: "fecha_finalizacion",
      nombre: "fecha_finalizacion",
      tipo: "date",
      label: "Fecha de Finalización",
      requerido: true,
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
    {
      id: "notas_documentacion",
      nombre: "notas_documentacion",
      tipo: "textarea",
      label: "Notas sobre la Documentación",
    },
  ],
  6: [
    {
      id: "presupuesto_inicial",
      nombre: "presupuesto_inicial",
      tipo: "number",
      label: "Presupuesto Inicial ($)",
      requerido: true,
    },
    {
      id: "prorrateo_materiales",
      nombre: "prorrateo_materiales",
      tipo: "number",
      label: "Prorrateo Materiales ($)",
      requerido: true,
    },
    {
      id: "prorrateo_materiales_detalle",
      nombre: "prorrateo_materiales_detalle",
      tipo: "textarea",
      label: "Detalle de Materiales",
    },
    {
      id: "prorrateo_mano_obra",
      nombre: "prorrateo_mano_obra",
      tipo: "number",
      label: "Prorrateo Mano de Obra ($)",
      requerido: true,
    },
    {
      id: "prorrateo_mano_obra_detalle",
      nombre: "prorrateo_mano_obra_detalle",
      tipo: "textarea",
      label: "Detalle de Mano de Obra",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],
  7: [
    {
      id: "descripcion_tecnica_finalidad",
      nombre: "descripcion_tecnica_finalidad",
      tipo: "textarea",
      label: "Descripción Técnica de la Finalidad",
      requerido: true,
    },
    {
      id: "cantidad_planos",
      nombre: "cantidad_planos",
      tipo: "number",
      label: "Cantidad de Planos",
    },
    {
      id: "registro_modificaciones",
      nombre: "registro_modificaciones",
      tipo: "textarea",
      label: "Registro de Modificaciones y Revisiones",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],
  8: [
    {
      id: "ubicacion_texto",
      nombre: "ubicacion_texto",
      tipo: "textarea",
      label: "Detalle de Ubicación / Geolocalización",
      requerido: true,
    },
    {
      id: "geo_latitud",
      nombre: "geo_latitud",
      tipo: "text",
      label: "Latitud",
      placeholder: "Ej: -34.6037",
    },
    {
      id: "geo_longitud",
      nombre: "geo_longitud",
      tipo: "text",
      label: "Longitud",
      placeholder: "Ej: -58.3816",
    },
    {
      id: "cantidad_fotos",
      nombre: "cantidad_fotos",
      tipo: "number",
      label: "Cantidad de Fotos Registradas",
    },
    {
      id: "descripcion_fotos",
      nombre: "descripcion_fotos",
      tipo: "textarea",
      label: "Descripción del Registro Fotográfico",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],

  // ============================================================
  // PROCESOS 9-12: TÉCNICOS OBRAS EN CURSO (Período 2022-2023)
  // y OBRAS TERMINADAS (Período 2023-2024)
  // ============================================================
  9: [
    // Documentación Ejecutiva (obras en curso 2022-2023) / Doc Ejecutiva (obras terminadas 2023-2024)
    {
      id: "plan_referencia",
      nombre: "plan_referencia",
      tipo: "textarea",
      label: "Plan de Mejoras y Ampliación (u otro)",
      descripcion: "Identificar el plan o programa al que corresponde la obra",
      requerido: true,
    },
    {
      id: "fecha_inicio_verificada",
      nombre: "fecha_inicio_verificada",
      tipo: "date",
      label: "Fecha de Inicio Verificada",
      descripcion: "Fecha de inicio de la obra según documentación",
      requerido: true,
    },
    {
      id: "fecha_finalizacion",
      nombre: "fecha_finalizacion",
      tipo: "date",
      label: "Fecha de Finalización",
      descripcion: "Fecha de finalización de la obra",
      requerido: true,
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      descripcion: "Nombre completo del responsable de la documentación",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
    {
      id: "notas_documentacion",
      nombre: "notas_documentacion",
      tipo: "textarea",
      label: "Notas sobre la Documentación",
    },
  ],

  10: [
    // Proceso 10: Presupuesto Inicial, Prorrateo en Materiales y Mano de Obra
    {
      id: "presupuesto_inicial",
      nombre: "presupuesto_inicial",
      tipo: "number",
      label: "Presupuesto Inicial ($)",
      descripcion: "Monto del presupuesto inicial de la obra",
      requerido: true,
    },
    {
      id: "prorrateo_materiales",
      nombre: "prorrateo_materiales",
      tipo: "number",
      label: "Prorrateo Materiales ($)",
      descripcion: "Discriminación del gasto en materiales",
      requerido: true,
    },
    {
      id: "prorrateo_materiales_detalle",
      nombre: "prorrateo_materiales_detalle",
      tipo: "textarea",
      label: "Detalle de Materiales",
      descripcion: "Descripción del desglose de materiales",
    },
    {
      id: "prorrateo_mano_obra",
      nombre: "prorrateo_mano_obra",
      tipo: "number",
      label: "Prorrateo Mano de Obra ($)",
      descripcion: "Discriminación del gasto en mano de obra",
      requerido: true,
    },
    {
      id: "prorrateo_mano_obra_detalle",
      nombre: "prorrateo_mano_obra_detalle",
      tipo: "textarea",
      label: "Detalle de Mano de Obra",
      descripcion: "Descripción del desglose de mano de obra",
    },
    {
      id: "fecha_inicio",
      nombre: "fecha_inicio",
      tipo: "date",
      label: "Fecha de Inicio",
      requerido: true,
    },
    {
      id: "fecha_fin",
      nombre: "fecha_fin",
      tipo: "date",
      label: "Fecha de Finalización",
      requerido: true,
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],

  11: [
    // Proceso 11: Planos y Descripción Técnica de la finalidad de las Obras
    {
      id: "descripcion_tecnica_finalidad",
      nombre: "descripcion_tecnica_finalidad",
      tipo: "textarea",
      label: "Descripción Técnica de la Finalidad",
      descripcion: "Descripción técnica del propósito y finalidad de la obra",
      requerido: true,
    },
    {
      id: "cantidad_planos",
      nombre: "cantidad_planos",
      tipo: "number",
      label: "Cantidad de Planos",
      descripcion: "Número de planos registrados",
    },
    {
      id: "registro_modificaciones",
      nombre: "registro_modificaciones",
      tipo: "textarea",
      label: "Registro de Modificaciones y Revisiones",
      descripcion: "Historial de modificaciones realizadas a los planos",
    },
    {
      id: "fecha_ultima_revision",
      nombre: "fecha_ultima_revision",
      tipo: "date",
      label: "Fecha Última Revisión",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],

  12: [
    // Proceso 12: Ubicación física de las obras (Terminada)
    {
      id: "ubicacion_texto",
      nombre: "ubicacion_texto",
      tipo: "textarea",
      label: "Detalle de Ubicación",
      descripcion: "Descripción detallada de la ubicación de la obra",
      requerido: true,
    },
    {
      id: "geo_latitud",
      nombre: "geo_latitud",
      tipo: "text",
      label: "Latitud",
      placeholder: "Ej: -34.6037",
      descripcion: "Coordenada de latitud (opcional)",
    },
    {
      id: "geo_longitud",
      nombre: "geo_longitud",
      tipo: "text",
      label: "Longitud",
      placeholder: "Ej: -58.3816",
      descripcion: "Coordenada de longitud (opcional)",
    },
    {
      id: "cantidad_fotos",
      nombre: "cantidad_fotos",
      tipo: "number",
      label: "Cantidad de Fotos Registradas",
      descripcion: "Número de fotografías en el registro",
    },
    {
      id: "descripcion_fotos",
      nombre: "descripcion_fotos",
      tipo: "textarea",
      label: "Descripción del Registro Fotográfico",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],

  // ============================================================
  // PROCESOS 13-16: OBRAS EN EJECUCIÓN (Períodos 2023-2024 y 2024-2025)
  // ============================================================

  13: [
    // Proceso 13: Documentación Ejecutiva de la Obra (En Ejecución)
    {
      id: "plan_referencia",
      nombre: "plan_referencia",
      tipo: "textarea",
      label: "Plan de Mejoras y Ampliación (u otro)",
      descripcion: "Identificar el plan o programa al que corresponde la obra",
      requerido: true,
    },
    {
      id: "fecha_inicio_verificada",
      nombre: "fecha_inicio_verificada",
      tipo: "date",
      label: "Fecha de Inicio Verificada",
      descripcion: "Fecha de inicio de la obra según documentación",
      requerido: true,
    },
    {
      id: "fecha_estimada_fin",
      nombre: "fecha_estimada_fin",
      tipo: "date",
      label: "Fecha Estimada de Finalización",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      descripcion: "Nombre completo del responsable de la documentación",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
    {
      id: "notas_documentacion",
      nombre: "notas_documentacion",
      tipo: "textarea",
      label: "Notas sobre la Documentación",
    },
  ],

  14: [
    // Proceso 14: Planos y Datos Técnicos de la finalidad de las Obras
    {
      id: "descripcion_tecnica_finalidad",
      nombre: "descripcion_tecnica_finalidad",
      tipo: "textarea",
      label: "Descripción Técnica de la Finalidad",
      descripcion: "Descripción técnica del propósito y finalidad de la obra",
      requerido: true,
    },
    {
      id: "datos_tecnicos",
      nombre: "datos_tecnicos",
      tipo: "textarea",
      label: "Datos Técnicos",
      descripcion: "Especificaciones y datos técnicos relevantes",
      requerido: true,
    },
    {
      id: "cantidad_planos",
      nombre: "cantidad_planos",
      tipo: "number",
      label: "Cantidad de Planos",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],

  15: [
    // Proceso 15: Presupuesto Inicial, Avance porcentual de la Obra
    {
      id: "presupuesto_inicial",
      nombre: "presupuesto_inicial",
      tipo: "number",
      label: "Presupuesto Inicial ($)",
      descripcion: "Monto del presupuesto inicial de la obra",
      requerido: true,
    },
    {
      id: "avance_porcentual",
      nombre: "avance_porcentual",
      tipo: "percentage",
      label: "Avance Porcentual de la Obra",
      descripcion: "Porcentaje de avance de la ejecución (0-100)",
      requerido: true,
    },
    {
      id: "monto_ejecutado",
      nombre: "monto_ejecutado",
      tipo: "number",
      label: "Monto Ejecutado ($)",
      descripcion: "Monto ejecutado hasta la fecha",
    },
    {
      id: "descripcion_avance",
      nombre: "descripcion_avance",
      tipo: "textarea",
      label: "Descripción del Avance",
      descripcion: "Detalle del estado de avance de la obra",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],

  16: [
    // Proceso 16: Ubicación física de las obras (En Ejecución)
    {
      id: "ubicacion_texto",
      nombre: "ubicacion_texto",
      tipo: "textarea",
      label: "Detalle de Ubicación",
      descripcion: "Descripción detallada de la ubicación de la obra",
      requerido: true,
    },
    {
      id: "geo_latitud",
      nombre: "geo_latitud",
      tipo: "text",
      label: "Latitud",
      placeholder: "Ej: -34.6037",
      descripcion: "Coordenada de latitud (opcional)",
    },
    {
      id: "geo_longitud",
      nombre: "geo_longitud",
      tipo: "text",
      label: "Longitud",
      placeholder: "Ej: -58.3816",
      descripcion: "Coordenada de longitud (opcional)",
    },
    {
      id: "descripcion_planimetrica",
      nombre: "descripcion_planimetrica",
      tipo: "textarea",
      label: "Descripción Demarcación Planimétrica",
      descripcion: "Detalle de la demarcación planimétrica de distribución de obras",
    },
    {
      id: "responsable_nombre",
      nombre: "responsable_nombre",
      tipo: "text",
      label: "Nombre del Responsable",
      requerido: true,
    },
    {
      id: "responsable_cargo",
      nombre: "responsable_cargo",
      tipo: "text",
      label: "Cargo/Rol del Responsable",
      requerido: true,
    },
  ],
}

export function getCamposProceso(numeroProceso: number): CampoProceso[] {
  return camposPorProceso[numeroProceso] || []
}

// Información adicional: objetivos y evidencias por proceso
// Procesos 1-12: Período 2022-2023 | Procesos 9-16: Período 2023-2024
export const infoProcesosPeriodo2: Record<number, { objetivo: string; evidencia: string; categoria: string }> = {
  1: {
    objetivo: "Constatar la recaudación mensual",
    evidencia: "Documentación probatoria mensual con identificación del responsable",
    categoria: "PROCESOS CONTABLES",
  },
  2: {
    objetivo: "Verificar coincidencia con el balance del fideicomiso",
    evidencia: "Documentación probatoria mensual",
    categoria: "PROCESOS CONTABLES",
  },
  3: {
    objetivo: "Constatar gastos rendidos de las obras",
    evidencia: "Documentación probatoria del costo con identificación del responsable",
    categoria: "PROCESOS CONTABLES",
  },
  4: {
    objetivo: "Verificar gasto mensual en ejecución",
    evidencia: "Documentación probatoria mensual con identificación del responsable",
    categoria: "PROCESOS CONTABLES",
  },
  5: {
    objetivo: "Verificar plan de mejoras y ampliación u otro",
    evidencia: "Documentación probatoria con identificación del responsable",
    categoria: "OBRAS FINALIZADAS",
  },
  6: {
    objetivo: "Discriminación del gasto (materiales y mano de obra)",
    evidencia: "Documentación probatoria con identificación del responsable",
    categoria: "OBRAS FINALIZADAS",
  },
  7: {
    objetivo: "Conformar archivo/registro técnico de obras",
    evidencia: "Documentación probatoria con identificación del responsable",
    categoria: "OBRAS FINALIZADAS",
  },
  8: {
    objetivo: "Detalle de ubicación/geolocalización y registro fotográfico",
    evidencia: "Registro fotográfico / evidencia",
    categoria: "OBRAS FINALIZADAS",
  },
  9: {
    objetivo: "Verificar plan de mejoras y ampliación u otro",
    evidencia: "Documentación probatoria con identificación del responsable",
    categoria: "OBRAS EN CURSO",
  },
  10: {
    objetivo: "Conformar archivo/registro de obras",
    evidencia: "Documentación probatoria con identificación del responsable",
    categoria: "OBRAS EN CURSO",
  },
  11: {
    objetivo: "Constatar avance de ejecución",
    evidencia: "Documentación probatoria con identificación del responsable",
    categoria: "OBRAS EN CURSO",
  },
  12: {
    objetivo: "Detalle ubicación/geolocalización (demarcación planimétrica)",
    evidencia: "Registro planimétrico / evidencia",
    categoria: "OBRAS EN CURSO",
  },
  // Procesos 9-12 en contexto 2023-2024 (Obras Terminadas) - usado cuando periodo es 2023-2024
  // Nota: 9-12 arriba es para 2022-2023 obras en curso. Para 2023-2024 obras terminadas ver infoProcesosObrasTerminadas2324
  13: {
    objetivo: "Identificar dentro del Plan de Mejoras y Ampliación u otro; verificar fecha de inicio.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRA EN EJECUCIÓN",
  },
  14: {
    objetivo: "Conformar archivo y registro de obras.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRA EN EJECUCIÓN",
  },
  15: {
    objetivo: "Constatar el avance de la ejecución en el período.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRA EN EJECUCIÓN",
  },
  16: {
    objetivo: "Detalle de ubicación o geolocalización.",
    evidencia: "Demarcación planimétrica de distribución de obras.",
    categoria: "OBRA EN EJECUCIÓN",
  },
}

// Info para procesos 9-12 cuando son Obras Terminadas (período 2023-2024)
const infoProcesosObrasTerminadas2324: Record<number, { objetivo: string; evidencia: string; categoria: string }> = {
  9: {
    objetivo: "Identificar dentro del Plan de Mejoras y Ampliación u otro; verificar fecha de inicio.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRAS TERMINADAS",
  },
  10: {
    objetivo: "Discriminación del gasto; fecha de inicio y finalización.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRAS TERMINADAS",
  },
  11: {
    objetivo: "Registrar modificaciones y revisiones; conformar archivo y registro de obras.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRAS TERMINADAS",
  },
  12: {
    objetivo: "Detalle de ubicación o geolocalización de la obra.",
    evidencia: "Registro fotográfico de obras.",
    categoria: "OBRAS TERMINADAS",
  },
}

export function getInfoProceso(
  numeroProceso: number,
  obra?: { periodo?: string | null; tipoObraAuditoria?: string | null }
) {
  // Período 2023-2024, Obra Terminada: procesos 9-12 usan info de obras terminadas
  if (
    obra?.periodo === "PERIODO_2023_2024" &&
    obra?.tipoObraAuditoria === "TERMINADA" &&
    numeroProceso >= 9 &&
    numeroProceso <= 12
  ) {
    return infoProcesosObrasTerminadas2324[numeroProceso] || null
  }
  return infoProcesosPeriodo2[numeroProceso] || null
}

