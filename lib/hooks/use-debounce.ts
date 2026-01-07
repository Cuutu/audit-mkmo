import { useEffect, useState } from "react"

/**
 * Hook personalizado para debounce de valores
 * @param value - Valor a debouncear
 * @param delay - Tiempo de espera en milisegundos (default: 500ms)
 * @returns Valor debounceado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

