import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { checkRateLimit } from "./rate-limit"

// Rate limit usa estado global - tests pueden afectarse entre sí
describe("checkRateLimit", () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    process.env.NODE_ENV = "production"
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it("permite primer intento", () => {
    const r = checkRateLimit("test-ip-1", "forgot-password")
    expect(r.success).toBe(true)
  })

  it("en modo test siempre permite", () => {
    process.env.NODE_ENV = "test"
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit("test-ip-test-mode", "login")
      expect(r.success).toBe(true)
    }
    process.env.NODE_ENV = "production"
  })
})
