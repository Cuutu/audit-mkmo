import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { generarExcelGlobal } from "@/lib/reportes/excel-generator"
import * as XLSX from "xlsx"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ano = searchParams.get("ano")
    const mes = searchParams.get("mes")
    const estado = searchParams.get("estado")

    const where: any = { deleted: false }
    if (ano) where.ano = parseInt(ano)
    
    // Manejar rango de meses (ej: "2-12" o solo "5")
    if (mes) {
      const mesParts = mes.split("-").map(m => m.trim())
      if (mesParts.length === 2) {
        // Rango de meses (ej: "2-12")
        const mesInicio = parseInt(mesParts[0])
        const mesFin = parseInt(mesParts[1])
        if (!isNaN(mesInicio) && !isNaN(mesFin) && mesInicio >= 1 && mesFin <= 12 && mesInicio <= mesFin) {
          where.mes = {
            gte: mesInicio,
            lte: mesFin,
          }
        }
      } else if (mesParts.length === 1) {
        // Mes único (ej: "5")
        const mesUnico = parseInt(mesParts[0])
        if (!isNaN(mesUnico) && mesUnico >= 1 && mesUnico <= 12) {
          where.mes = mesUnico
        }
      }
    }
    // Si no se especifica mes, se incluyen todos los meses del año (o todos si tampoco hay año)
    
    if (estado) where.estado = estado

    const obras = await prisma.obra.findMany({
      where,
      include: {
        procesos: {
          orderBy: { numero: "asc" },
        },
        archivos: {
          where: { deleted: false },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: [{ ano: "desc" }, { mes: "desc" }, { numero: "asc" }],
    })

    // Registrar generación de reporte global en logs
    await createAuditLog({
      accion: "READ",
      entidad: "Reporte",
      entidadId: "global",
      userId: session.user.id,
      campo: "reporte_global_excel",
      valorNuevo: JSON.stringify({
        tipo: "global",
        formato: "excel",
        filtros: {
          ano: ano || "todos",
          mes: mes || "todos",
          estado: estado || "todos",
        },
        cantidadObras: obras.length,
        fechaGeneracion: new Date().toISOString(),
      }),
    })

    const workbook = generarExcelGlobal(obras)
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    const nombreMes = mes || "todos"
    const nombreArchivo = `reporte-global-${ano || "todos"}-mes-${nombreMes}-${estado || "todos"}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    })
  } catch (error) {
    console.error("Error al generar reporte global:", error)
    return NextResponse.json(
      { error: "Error al generar reporte global" },
      { status: 500 }
    )
  }
}

