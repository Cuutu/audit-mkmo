// Definición de campos estructurados por proceso

export interface CampoProceso {
  id: string
  nombre: string
  tipo: "text" | "number" | "date" | "textarea" | "select" | "checkbox" | "file" | "percentage"
  label: string
  placeholder?: string
  requerido?: boolean
  opciones?: string[] // Para tipo select
  valor?: any
  descripcion?: string // Descripción o ayuda contextual
  acceptedFiles?: string // Para tipo file, ej: ".pdf,.jpg,.png"
}

// Estructura de campos por proceso (1-16)
export const camposPorProceso: Record<number, CampoProceso[]> = {
  1: [
    // Proceso 1: Definición técnica de la obra
    {
      id: "descripcion_tecnica",
      nombre: "descripcion_tecnica",
      tipo: "textarea",
      label: "Descripción Técnica",
      requerido: true,
    },
    {
      id: "tipo_obra",
      nombre: "tipo_obra",
      tipo: "select",
      label: "Tipo de Obra",
      requerido: true,
      opciones: ["Infraestructura", "Edificación", "Obra Civil", "Otro"],
    },
    {
      id: "ubicacion",
      nombre: "ubicacion",
      tipo: "text",
      label: "Ubicación",
      requerido: true,
    },
    {
      id: "superficie",
      nombre: "superficie",
      tipo: "number",
      label: "Superficie (m²)",
    },
  ],
  2: [
    // Proceso 2: Proyecto / costo proyectado / cronograma
    {
      id: "costo_proyectado",
      nombre: "costo_proyectado",
      tipo: "number",
      label: "Costo Proyectado ($)",
      requerido: true,
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
      label: "Fecha de Finalización Prevista",
    },
    {
      id: "observaciones_cronograma",
      nombre: "observaciones_cronograma",
      tipo: "textarea",
      label: "Observaciones del Cronograma",
    },
  ],
  3: [
    // Proceso 3: Constatación
    {
      id: "fecha_constatacion",
      nombre: "fecha_constatacion",
      tipo: "date",
      label: "Fecha de Constatación",
      requerido: true,
    },
    {
      id: "planos_revisados",
      nombre: "planos_revisados",
      tipo: "checkbox",
      label: "Planos Revisados",
    },
    {
      id: "revisiones_realizadas",
      nombre: "revisiones_realizadas",
      tipo: "number",
      label: "Número de Revisiones",
    },
    {
      id: "fotos_registradas",
      nombre: "fotos_registradas",
      tipo: "number",
      label: "Fotos Registradas",
    },
  ],
  4: [
    // Proceso 4: Método de redeterminación
    {
      id: "metodo_redeterminacion",
      nombre: "metodo_redeterminacion",
      tipo: "select",
      label: "Método de Redeterminación",
      requerido: true,
      opciones: ["Índices", "Relevamiento", "Mixto", "Otro"],
    },
    {
      id: "desglose_economico",
      nombre: "desglose_economico",
      tipo: "textarea",
      label: "Desglose Económico",
    },
    {
      id: "prevision_fondos",
      nombre: "prevision_fondos",
      tipo: "number",
      label: "Previsión de Fondos ($)",
    },
  ],
  5: [
    // Proceso 5: Materiales
    {
      id: "materiales_principales",
      nombre: "materiales_principales",
      tipo: "textarea",
      label: "Materiales Principales",
      requerido: true,
    },
    {
      id: "origen_materiales",
      nombre: "origen_materiales",
      tipo: "text",
      label: "Origen de Materiales",
    },
    {
      id: "responsable_materiales",
      nombre: "responsable_materiales",
      tipo: "text",
      label: "Responsable de Materiales",
    },
  ],
  6: [
    // Proceso 6: Mano de obra
    {
      id: "mano_obra_tercerizada",
      nombre: "mano_obra_tercerizada",
      tipo: "checkbox",
      label: "Mano de Obra Tercerizada",
    },
    {
      id: "cantidad_trabajadores",
      nombre: "cantidad_trabajadores",
      tipo: "number",
      label: "Cantidad de Trabajadores",
    },
    {
      id: "responsable_mano_obra",
      nombre: "responsable_mano_obra",
      tipo: "text",
      label: "Responsable de Mano de Obra",
    },
    {
      id: "pagos_realizados",
      nombre: "pagos_realizados",
      tipo: "number",
      label: "Pagos Realizados ($)",
    },
  ],
  7: [
    // Proceso 7: Creación de base de datos
    {
      id: "estructura_bd",
      nombre: "estructura_bd",
      tipo: "textarea",
      label: "Estructura de Base de Datos",
      requerido: true,
    },
    {
      id: "orden_datos",
      nombre: "orden_datos",
      tipo: "textarea",
      label: "Orden de Carga de Datos",
    },
    {
      id: "fecha_carga",
      nombre: "fecha_carga",
      tipo: "date",
      label: "Fecha de Carga",
    },
  ],
  8: [
    // Proceso 8: Análisis de resultados
    {
      id: "resultados_obtenidos",
      nombre: "resultados_obtenidos",
      tipo: "textarea",
      label: "Resultados Obtenidos",
      requerido: true,
    },
    {
      id: "conclusiones",
      nombre: "conclusiones",
      tipo: "textarea",
      label: "Conclusiones",
    },
    {
      id: "recomendaciones",
      nombre: "recomendaciones",
      tipo: "textarea",
      label: "Recomendaciones",
    },
  ],

  // ============================================================
  // PROCESOS 9-12: OBRAS TERMINADAS (Períodos 2023-2024 y 2024-2025)
  // ============================================================

  9: [
    // Proceso 9: Documentación Ejecutiva de la Obra (Terminada)
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

// Información adicional de procesos 9-16 (objetivos y evidencias requeridas)
export const infoProcesosPeriodo2 = {
  9: {
    objetivo: "Identificar dentro del Plan de Mejoras y Ampliación u otro; verificar fecha de inicio.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRA TERMINADA",
  },
  10: {
    objetivo: "Discriminación del gasto; fecha de inicio y finalización.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRA TERMINADA",
  },
  11: {
    objetivo: "Registrar modificaciones y revisiones; conformar archivo y registro de obras.",
    evidencia: "Documentación probatoria con identificación del responsable.",
    categoria: "OBRA TERMINADA",
  },
  12: {
    objetivo: "Detalle de ubicación o geolocalización de la obra.",
    evidencia: "Registro fotográfico de obras.",
    categoria: "OBRA TERMINADA",
  },
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

export function getInfoProceso(numeroProceso: number) {
  return infoProcesosPeriodo2[numeroProceso as keyof typeof infoProcesosPeriodo2] || null
}

