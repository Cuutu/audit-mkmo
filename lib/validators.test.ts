import { describe, it, expect } from "vitest"
import {
  isMongoObjectId,
  requireObjectId,
  safeContentDispositionFilename,
} from "./validators"

describe("isMongoObjectId", () => {
  it("acepta ObjectId válido de 24 hex", () => {
    expect(isMongoObjectId("507f1f77bcf86cd799439011")).toBe(true)
    expect(isMongoObjectId("abcdef0123456789abcdef01")).toBe(true)
  })

  it("rechaza ids inválidos", () => {
    expect(isMongoObjectId("")).toBe(false)
    expect(isMongoObjectId("123")).toBe(false)
    expect(isMongoObjectId("507f1f77bcf86cd79943901")).toBe(false) // 23 chars
    expect(isMongoObjectId("507f1f77bcf86cd7994390112")).toBe(false) // 25 chars
    expect(isMongoObjectId("507f1f77bcf86cd79943901g")).toBe(false) // 'g' no es hex
    expect(isMongoObjectId(null)).toBe(false)
    expect(isMongoObjectId(undefined)).toBe(false)
    expect(isMongoObjectId(123)).toBe(false)
  })
})

describe("requireObjectId", () => {
  it("retorna null para id válido", () => {
    expect(requireObjectId("507f1f77bcf86cd799439011")).toBeNull()
  })

  it("retorna NextResponse 400 para id inválido", async () => {
    const result = requireObjectId("invalid")
    expect(result).not.toBeNull()
    if (result) {
      const body = await result.json()
      expect(result.status).toBe(400)
      expect(body).toMatchObject({ error: "ID inválido" })
    }
  })
})

describe("safeContentDispositionFilename", () => {
  it("sanitiza CR/LF y comillas", () => {
    expect(safeContentDispositionFilename('archivo\r\n"malo".pdf')).not.toMatch(/[\r\n"]/)
  })

  it("reemplaza caracteres no imprimibles por _", () => {
    const result = safeContentDispositionFilename("archivo\x00\x01.pdf")
    expect(result).toMatch(/^archivo__\.pdf$/)
  })

  it("limita a 255 caracteres", () => {
    const long = "a".repeat(300)
    expect(safeContentDispositionFilename(long).length).toBeLessThanOrEqual(255)
  })

  it("retorna 'archivo' si queda vacío", () => {
    expect(safeContentDispositionFilename("   \r\n   ")).toBe("archivo")
  })

  it("preserva nombres normales", () => {
    expect(safeContentDispositionFilename("reporte-2024.xlsx")).toBe("reporte-2024.xlsx")
  })
})
