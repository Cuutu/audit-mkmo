import * as XLSX from "xlsx"
import { Obra, Proceso, Archivo } from "@prisma/client"

interface ObraCompleta extends Obra {
  procesos: Proceso[]
  archivos: Archivo[]
  createdBy: { name: string }
}

export function generarExcelObra(obra: ObraCompleta): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()

  // Hoja 1: Información de la Obra
  const infoObra = [
    ["REPORTE DE OBRA"],
    [],
    ["Número:", obra.numero],
    ["Nombre:", obra.nombre],
    ["Mes/Año:", `${obra.mes}/${obra.ano}`],
    ["Estado:", obra.estado],
    ["Avance:", `${obra.avance}%`],
    ["Creada por:", obra.createdBy.name],
    ["Fecha creación:", obra.createdAt.toLocaleDateString("es-AR")],
    [],
    ["Observaciones:", obra.observaciones || ""],
  ]

  const wsInfo = XLSX.utils.aoa_to_sheet(infoObra)
  XLSX.utils.book_append_sheet(workbook, wsInfo, "Información")

  // Hoja 2: Procesos
  if (obra.procesos && obra.procesos.length > 0) {
    const procesosData = [
      ["#", "Proceso", "Estado", "Avance", "Responsable", "Última Actualización"],
      ...obra.procesos.map((proceso) => [
        proceso.numero,
        proceso.nombre,
        proceso.estado,
        proceso.avance,
        proceso.responsable,
        proceso.updatedAt.toLocaleDateString("es-AR"),
      ]),
    ]

    const wsProcesos = XLSX.utils.aoa_to_sheet(procesosData)
    XLSX.utils.book_append_sheet(workbook, wsProcesos, "Procesos")
  }

  // Hoja 3: Archivos
  if (obra.archivos && obra.archivos.length > 0) {
    const archivosData = [
      ["Nombre", "Tipo", "Tamaño (bytes)", "Versión", "Fecha"],
      ...obra.archivos.map((archivo) => [
        archivo.nombreOriginal,
        archivo.tipo,
        archivo.tamano,
        archivo.version,
        archivo.createdAt.toLocaleDateString("es-AR"),
      ]),
    ]

    const wsArchivos = XLSX.utils.aoa_to_sheet(archivosData)
    XLSX.utils.book_append_sheet(workbook, wsArchivos, "Archivos")
  }

  return workbook
}

export function generarExcelGlobal(obras: ObraCompleta[]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()

  const meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                 "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

  // Hoja 1: Resumen
  const resumenData = [
    ["REPORTE GLOBAL"],
    [`Generado el: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`],
    [],
    ["ESTADÍSTICAS GENERALES"],
    ["Total de Obras:", obras.length],
    [
      "Obras No Iniciadas:",
      obras.filter((o) => o.estado === "NO_INICIADA").length,
    ],
    [
      "Obras En Proceso:",
      obras.filter((o) => o.estado === "EN_PROCESO").length,
    ],
    [
      "Obras Finalizadas:",
      obras.filter((o) => o.estado === "FINALIZADA").length,
    ],
    [
      "Avance Promedio:",
      obras.length > 0
        ? Math.round(
            obras.reduce((acc, o) => acc + o.avance, 0) / obras.length
          )
        : 0,
      "%",
    ],
    [],
    ["DISTRIBUCIÓN POR AÑO"],
    ...Object.entries(
      obras.reduce((acc, obra) => {
        acc[obra.ano] = (acc[obra.ano] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    )
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([ano, cantidad]) => [`Año ${ano}:`, cantidad]),
    [],
    ["DISTRIBUCIÓN POR MES"],
    ...Object.entries(
      obras.reduce((acc, obra) => {
        const mesNombre = meses[obra.mes] || `Mes ${obra.mes}`
        acc[mesNombre] = (acc[mesNombre] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    )
      .sort(([a], [b]) => {
        const mesA = meses.indexOf(a)
        const mesB = meses.indexOf(b)
        return (mesA === -1 ? 13 : mesA) - (mesB === -1 ? 13 : mesB)
      })
      .map(([mes, cantidad]) => [`${mes}:`, cantidad]),
  ]

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
  XLSX.utils.book_append_sheet(workbook, wsResumen, "Resumen")

  // Hoja 2: Listado Completo de Obras
  const obrasData = [
    [
      "Número",
      "Nombre",
      "Año",
      "Mes",
      "Mes (Nombre)",
      "Estado",
      "Avance (%)",
      "Procesos Totales",
      "Procesos Completados",
      "Archivos Adjuntos",
      "Creada por",
      "Fecha Creación",
      "Última Actualización",
      "Observaciones",
    ],
    ...obras.map((obra) => {
      const procesosCompletados = obra.procesos?.filter(
        (p) => p.estado === "APROBADO"
      ).length || 0
      const procesosTotales = obra.procesos?.length || 0
      const archivosTotales = obra.archivos?.length || 0

      return [
        obra.numero,
        obra.nombre,
        obra.ano,
        obra.mes,
        meses[obra.mes] || `Mes ${obra.mes}`,
        obra.estado,
        obra.avance,
        procesosTotales,
        procesosCompletados,
        archivosTotales,
        obra.createdBy.name,
        obra.createdAt.toLocaleDateString("es-AR"),
        obra.updatedAt.toLocaleDateString("es-AR"),
        obra.observaciones || "",
      ]
    }),
  ]

  const wsObras = XLSX.utils.aoa_to_sheet(obrasData)
  XLSX.utils.book_append_sheet(workbook, wsObras, "Obras")

  // Hoja 3: Detalle de Procesos
  if (obras.some((o) => o.procesos && o.procesos.length > 0)) {
    const procesosData = [
      [
        "Obra",
        "Número Obra",
        "Año",
        "Mes",
        "Proceso #",
        "Nombre Proceso",
        "Estado",
        "Avance (%)",
        "Responsable",
        "Última Actualización",
      ],
      ...obras.flatMap((obra) =>
        (obra.procesos || []).map((proceso) => [
          obra.nombre,
          obra.numero,
          obra.ano,
          obra.mes,
          proceso.numero,
          proceso.nombre,
          proceso.estado,
          proceso.avance,
          proceso.responsable,
          proceso.updatedAt.toLocaleDateString("es-AR"),
        ])
      ),
    ]

    const wsProcesos = XLSX.utils.aoa_to_sheet(procesosData)
    XLSX.utils.book_append_sheet(workbook, wsProcesos, "Procesos")
  }

  // Hoja 4: Resumen por Año y Mes
  const años = [...new Set(obras.map((o) => o.ano))].sort((a, b) => b - a)
  const resumenAnoMesData = [
    ["RESUMEN POR AÑO Y MES"],
    [],
    ["Año", "Mes", "Mes (Nombre)", "Total Obras", "No Iniciadas", "En Proceso", "Finalizadas", "Avance Promedio (%)"],
    ...años.flatMap((ano) => {
      const obrasDelAno = obras.filter((o) => o.ano === ano)
      const mesesDelAno = [...new Set(obrasDelAno.map((o) => o.mes))].sort((a, b) => a - b)

      return mesesDelAno.map((mes) => {
        const obrasMes = obrasDelAno.filter((o) => o.mes === mes)
        const noIniciadas = obrasMes.filter((o) => o.estado === "NO_INICIADA").length
        const enProceso = obrasMes.filter((o) => o.estado === "EN_PROCESO").length
        const finalizadas = obrasMes.filter((o) => o.estado === "FINALIZADA").length
        const avancePromedio = obrasMes.length > 0
          ? Math.round(obrasMes.reduce((acc, o) => acc + o.avance, 0) / obrasMes.length)
          : 0

        return [
          ano,
          mes,
          meses[mes] || `Mes ${mes}`,
          obrasMes.length,
          noIniciadas,
          enProceso,
          finalizadas,
          avancePromedio,
        ]
      })
    }),
  ]

  const wsResumenAnoMes = XLSX.utils.aoa_to_sheet(resumenAnoMesData)
  XLSX.utils.book_append_sheet(workbook, wsResumenAnoMes, "Resumen Año-Mes")

  return workbook
}

