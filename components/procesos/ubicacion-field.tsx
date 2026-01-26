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
    const pastedText = e.clipboardData.getData("text")
    if (isGoogleMapsLink(pastedText)) {
      handleChange(pastedText)
    }
  }

  return (
    <div className="space-y-2">
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
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>Link de Google Maps detectado</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 ml-1 text-xs"
            onClick={() => window.open(inputValue, "_blank")}
          >
            Abrir en nueva pestaña
          </Button>
        </div>
      )}
    </div>
  )
}
