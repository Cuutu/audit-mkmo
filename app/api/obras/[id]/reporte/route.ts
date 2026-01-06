import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generarReporteCompleto, generarMatrizControl, generarDiagramaFlujo } from "@/lib/reportes/pdf-generator"
import { generarExcelObra } from "@/lib/reportes/excel-generator"
import * as XLSX from "xlsx"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") || "completo"
    const formato = searchParams.get("formato") || "pdf"

    const obra = await prisma.obra.findUnique({
      where: { id: params.id, deleted: false },
      include: {
        procesos: {
          orderBy: { numero: "asc" },
        },
        archivos: {
          where: { deleted: false },
          orderBy: { createdAt: "desc" },
        },
        createdBy: {
          select: { name: true },
        },
      },
    })

    if (!obra) {
      return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 })
    }

    if (formato === "pdf") {
      let doc
      if (tipo === "matriz") {
        doc = generarMatrizControl(obra)
      } else if (tipo === "flujo") {
        doc = generarDiagramaFlujo(obra)
      } else {
        doc = generarReporteCompleto(obra)
      }

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="reporte-obra-${obra.numero}-${tipo}.pdf"`,
        },
      })
    } else if (formato === "excel") {
      const workbook = generarExcelObra(obra)
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="reporte-obra-${obra.numero}.xlsx"`,
        },
      })
    }

    return NextResponse.json({ error: "Formato no válido" }, { status: 400 })
  } catch (error) {
    console.error("Error al generar reporte:", error)
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    )
  }
}

