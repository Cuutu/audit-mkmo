// Definición de campos estructurados por proceso

export interface CampoProceso {
  id: string
  nombre: string
  tipo: "text" | "number" | "date" | "textarea" | "select" | "checkbox"
  label: string
  placeholder?: string
  requerido?: boolean
  opciones?: string[] // Para tipo select
  valor?: any
}

// Estructura de campos por proceso (1-8)
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
}

export function getCamposProceso(numeroProceso: number): CampoProceso[] {
  return camposPorProceso[numeroProceso] || []
}

