"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"

interface UbicacionFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

export function UbicacionField({
  id,
  value,
  onChange,
  disabled,
  required,
}: UbicacionFieldProps) {
  const [inputValue, setInputValue] = useState(value || "")

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
  }

  const isGoogleMapsLink = (text: string): boolean => {
    if (!text || !text.trim()) return false
    const trimmed = text.trim()
    return (
      trimmed.includes("maps.google") ||
      trimmed.includes("google.com/maps") ||
      trimmed.includes("goo.gl/maps") ||
      trimmed.includes("maps.app.goo.gl") ||
      trimmed.startsWith("https://maps.app.goo.gl") ||
      trimmed.startsWith("http://maps.google") ||
      trimmed.startsWith("https://maps.google") ||
      trimmed.startsWith("http://goo.gl/maps") ||
      trimmed.startsWith("https://goo.gl/maps")
    )
  }

  // Obtener URL para abrir en Google Maps
  const getMapsUrl = (text: string): string => {
    if (isGoogleMapsLink(text)) {
      // Si ya es un link de Google Maps, usarlo directamente
      return text.trim()
    } else {
      // Si es una dirección normal, crear un link de búsqueda
      const encodedAddress = encodeURIComponent(text.trim())
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    }
  }

  const handleSearchInMaps = () => {
    if (inputValue.trim()) {
      const mapsUrl = getMapsUrl(inputValue)
      window.open(mapsUrl, "_blank")
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault() // Prevenir el comportamiento por defecto
    const pastedText = e.clipboardData.getData("text")
    // Limpiar el texto pegado de espacios y saltos de línea
    const cleanText = pastedText.trim()
    if (cleanText) {
      handleChange(cleanText)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            id={id}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Ingrese dirección o pegue un link de Google Maps"
            disabled={disabled}
            required={required}
            className="pr-10"
          />
          {isGoogleMapsLink(inputValue) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSearchInMaps}
          disabled={disabled || !inputValue.trim()}
          title="Buscar en Google Maps"
          className="flex-shrink-0"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      
      {inputValue.trim() && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <a
            href={getMapsUrl(inputValue)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
          >
            Ver en Google Maps
          </a>
        </div>
      )}
    </div>
  )
}
