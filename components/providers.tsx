"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { useState } from "react"
import { PWAInstall } from "@/components/pwa/pwa-install"
import { ToastContainer } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ConfirmDialogContainer } from "@/components/ui/confirm-dialog"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos para datos que cambian poco
        gcTime: 10 * 60 * 1000, // 10 minutos en cache (antes cacheTime en v4)
        refetchOnWindowFocus: false,
        retry: 1, // Solo reintentar una vez en caso de error
      },
      mutations: {
        retry: false, // No reintentar mutaciones
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <PWAInstall />
          <ToastContainer />
          <ConfirmDialogContainer />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

