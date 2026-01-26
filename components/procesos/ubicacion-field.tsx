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
    return (
      text.includes("maps.google") ||
      text.includes("google.com/maps") ||
      text.includes("goo.gl/maps") ||
      text.startsWith("https://maps.app.goo.gl") ||
      text.startsWith("http://maps.google") ||
      text.startsWith("https://maps.google")
    )
  }

  // Convertir link de Google Maps a formato embeddable
  const getEmbedUrl = (url: string): string | null => {
    try {
      // Para links con coordenadas (@lat,lng)
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+[zm]))?/)
      if (coordMatch) {
        const lat = coordMatch[1]
        const lng = coordMatch[2]
        // Usar el formato de iframe de Google Maps sin API key
        return `https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`
      }

      // Para links de place, extraer el nombre del lugar
      const placeMatch = url.match(/\/place\/([^/?]+)/)
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
        const encodedPlace = encodeURIComponent(placeName)
        return `https://www.google.com/maps?q=${encodedPlace}&hl=es&output=embed`
      }

      // Para links de búsqueda
      const searchMatch = url.match(/\/search\/([^/?]+)/)
      if (searchMatch) {
        const searchQuery = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
        const encodedQuery = encodeURIComponent(searchQuery)
        return `https://www.google.com/maps?q=${encodedQuery}&hl=es&output=embed`
      }

      // Para links cortos de maps.app.goo.gl, no podemos incrustarlos directamente
      // sin expandirlos primero, así que retornamos null
      if (url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps")) {
        return null
      }

      // Intentar usar el link directamente si tiene el formato correcto
      if (url.includes("google.com/maps") && !url.includes("embed")) {
        // Agregar output=embed al final del link
        const separator = url.includes("?") ? "&" : "?"
        return `${url}${separator}output=embed`
      }

      return null
    } catch {
      return null
    }
  }

  const handleSearchInMaps = () => {
    if (inputValue.trim()) {
      // Si ya es un link de Google Maps, abrirlo directamente
      if (isGoogleMapsLink(inputValue)) {
        window.open(inputValue, "_blank")
      } else {
        // Si es una dirección, buscar en Google Maps
        const encodedAddress = encodeURIComponent(inputValue)
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
        window.open(mapsUrl, "_blank")
      }
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

  const embedUrl = isGoogleMapsLink(inputValue) ? getEmbedUrl(inputValue) : null

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
      
      {isGoogleMapsLink(inputValue) && (
        <div className="space-y-2">
          {embedUrl ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={embedUrl}
                className="w-full"
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/50 text-center text-sm text-muted-foreground">
              <p>El mapa se mostrará al guardar el enlace</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <a
              href={inputValue}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              Ver en Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
