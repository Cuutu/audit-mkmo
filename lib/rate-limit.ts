/**
 * Rate limit simple en memoria.
 * Uso: para login y forgot-password. En serverless puede resetear entre invocaciones.
 */

const store = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 1000 // 1 minuto
const MAX_ATTEMPTS = 5

function getKey(identifier: string, action: string): string {
  return `${action}:${identifier}`
}

function cleanup(): void {
  const now = Date.now()
  for (const [key, v] of store.entries()) {
    if (v.resetAt < now) store.delete(key)
  }
}

/**
 * Verifica si el identificador (IP o email) excedió el límite.
 * Retorna null si OK, o NextResponse 429 si excedido.
 */
export function checkRateLimit(
  identifier: string,
  action: "login" | "forgot-password"
): { success: true } | { success: false; response: Response } {
  if (process.env.NODE_ENV === "test") {
    return { success: true }
  }

  cleanup()

  const key = getKey(identifier, action)
  const now = Date.now()
  const entry = store.get(key)

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { success: true }
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { success: true }
  }

  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: "Demasiados intentos. Espere un momento antes de reintentar.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          },
        }
      ),
    }
  }

  return { success: true }
}
