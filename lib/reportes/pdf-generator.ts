import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Obra, Proceso, Archivo } from "@prisma/client"

interface ObraCompleta extends Obra {
  procesos: Proceso[]
  archivos: Archivo[]
  createdBy: { name: string }
}

export function generarReporteCompleto(obra: ObraCompleta): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20

  // Encabezado
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("REPORTE COMPLETO DE OBRA", pageWidth / 2, yPos, { align: "center" })
  yPos += 10

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Generado el: ${new Date().toLocaleDateString("es-AR")}`, pageWidth / 2, yPos, {
    align: "center",
  })
  yPos += 15

  // Información de la Obra
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("INFORMACIÓN DE LA OBRA", 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const infoObra = [
    [`Número:`, obra.numero],
    [`Nombre:`, obra.nombre],
    [`Mes/Año:`, `${obra.mes}/${obra.ano}`],
    [`Estado:`, obra.estado],
    [`Avance:`, `${obra.avance}%`],
    [`Creada por:`, obra.createdBy.name],
    [`Fecha creación:`, obra.createdAt.toLocaleDateString("es-AR")],
  ]

  infoObra.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, 14, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(String(value), 60, yPos)
    yPos += 6
  })

  if (obra.observaciones) {
    yPos += 3
    doc.setFont("helvetica", "bold")
    doc.text("Observaciones:", 14, yPos)
    yPos += 6
    doc.setFont("helvetica", "normal")
    const observaciones = doc.splitTextToSize(obra.observaciones, pageWidth - 28)
    doc.text(observaciones, 14, yPos)
    yPos += observaciones.length * 5 + 5
  }

  yPos += 5

  // Procesos
  if (obra.procesos && obra.procesos.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("PROCESOS", 14, yPos)
    yPos += 10

    const procesosData = obra.procesos.map((proceso) => [
      proceso.numero.toString(),
      proceso.nombre,
      proceso.estado,
      `${proceso.avance}%`,
      proceso.responsable,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["#", "Proceso", "Estado", "Avance", "Responsable"]],
      body: procesosData,
      theme: "striped",
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 9 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Archivos
  if (obra.archivos && obra.archivos.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("ARCHIVOS ADJUNTOS", 14, yPos)
    yPos += 10

    const archivosData = obra.archivos.map((archivo) => [
      archivo.nombreOriginal,
      archivo.tipo,
      formatFileSize(archivo.tamano),
      archivo.version.toString(),
      archivo.createdAt.toLocaleDateString("es-AR"),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Nombre", "Tipo", "Tamaño", "Versión", "Fecha"]],
      body: archivosData,
      theme: "striped",
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 9 },
    })
  }

  // Pie de página
  const totalPages = (doc as any).internal.pages.length
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc
}

export function generarMatrizControl(obra: ObraCompleta): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Encabezado
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("MATRIZ DE CONTROL", pageWidth / 2, yPos, { align: "center" })
  yPos += 8

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Obra: ${obra.numero} - ${obra.nombre}`, pageWidth / 2, yPos, {
    align: "center",
  })
  yPos += 5
  doc.text(`Mes/Año: ${obra.mes}/${obra.ano}`, pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // Matriz
  if (obra.procesos && obra.procesos.length > 0) {
    const matrizData = obra.procesos.map((proceso) => [
      proceso.numero.toString(),
      proceso.nombre,
      proceso.responsable,
      proceso.estado,
      `${proceso.avance}%`,
      proceso.updatedAt.toLocaleDateString("es-AR"),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["#", "Proceso", "Responsable", "Estado", "Avance", "Última Actualización"]],
      body: matrizData,
      theme: "grid",
      headStyles: { fillColor: [0, 102, 204] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 40 },
      },
    })
  }

  return doc
}

export function generarDiagramaFlujo(obra: ObraCompleta): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Encabezado
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("DIAGRAMA DE FLUJO DE PROCESOS", pageWidth / 2, yPos, { align: "center" })
  yPos += 8

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Obra: ${obra.numero} - ${obra.nombre}`, pageWidth / 2, yPos, {
    align: "center",
  })
  yPos += 15

  // Diagrama de flujo simple
  if (obra.procesos && obra.procesos.length > 0) {
    const procesos = obra.procesos.sort((a, b) => a.numero - b.numero)
    const boxWidth = 80
    const boxHeight = 15
    const startX = (pageWidth - boxWidth) / 2
    const spacing = 25

    procesos.forEach((proceso, index) => {
      const x = startX
      const y = yPos + index * spacing

      // Flecha hacia abajo (excepto el último)
      if (index < procesos.length - 1) {
        doc.setLineWidth(0.5)
        doc.line(x + boxWidth / 2, y + boxHeight, x + boxWidth / 2, y + spacing - 5)
        // Punta de flecha
        doc.line(x + boxWidth / 2, y + spacing - 5, x + boxWidth / 2 - 2, y + spacing - 7)
        doc.line(x + boxWidth / 2, y + spacing - 5, x + boxWidth / 2 + 2, y + spacing - 7)
      }

      // Caja del proceso
      doc.setDrawColor(0, 102, 204)
      doc.setFillColor(240, 248, 255)
      doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, "FD")

      // Texto del proceso
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text(`P${proceso.numero}`, x + 5, y + 7)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      const nombre = doc.splitTextToSize(proceso.nombre, boxWidth - 10)
      doc.text(nombre, x + 5, y + 12)

      // Estado con color
      doc.setFontSize(7)
      const estadoColors: Record<string, [number, number, number]> = {
        NO_INICIADO: [128, 128, 128],
        EN_CURSO: [255, 165, 0],
        EN_REVISION: [0, 123, 255],
        APROBADO: [40, 167, 69],
      }
      const color = estadoColors[proceso.estado] || [128, 128, 128]
      doc.setTextColor(color[0], color[1], color[2])
      doc.text(proceso.estado, x + boxWidth - 5, y + 7, { align: "right" })
    })

    yPos += procesos.length * spacing + 10

    // Leyenda
    if (yPos < doc.internal.pageSize.getHeight() - 30) {
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text("LEYENDA", 14, yPos)
      yPos += 8

      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      const estados = [
        ["NO_INICIADO", "Gris"],
        ["EN_CURSO", "Naranja"],
        ["EN_REVISION", "Azul"],
        ["APROBADO", "Verde"],
      ]

      estados.forEach(([estado, color]) => {
        doc.text(`${estado}: ${color}`, 20, yPos)
        yPos += 5
      })
    }
  }

  return doc
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

