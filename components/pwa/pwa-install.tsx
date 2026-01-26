"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Verificar si es un dispositivo móvil
    const checkMobile = () => {
      const isMobileDevice = 
        window.matchMedia("(max-width: 768px)").matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Verificar si ya está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return () => {
        window.removeEventListener('resize', checkMobile)
      }
    }

    // Registrar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Registrar el service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado:", registration.scope)
        })
        .catch((error) => {
          console.error("Error al registrar Service Worker:", error)
        })
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("Usuario aceptó la instalación")
      setShowInstallButton(false)
      setIsInstalled(true)
    } else {
      console.log("Usuario rechazó la instalación")
    }

    setDeferredPrompt(null)
  }

  // Solo mostrar en dispositivos móviles
  if (!isMobile || isInstalled || !showInstallButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-in slide-in-from-bottom-5 max-w-sm sm:max-w-none">
      <div className="bg-background border rounded-lg shadow-lg p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm mb-1">Instalar App</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Instala esta app en tu dispositivo para acceso rápido y mejor experiencia.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="flex-1 text-xs sm:text-sm"
              >
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInstallButton(false)}
                className="flex-shrink-0"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

