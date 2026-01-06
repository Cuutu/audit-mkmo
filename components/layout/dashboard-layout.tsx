"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  Menu,
  X,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Obras", href: "/dashboard/obras", icon: Building2 },
  { name: "Papelera", href: "/dashboard/papelera", icon: Trash2 },
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
  { name: "Administración", href: "/dashboard/admin", icon: Settings, adminOnly: true },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <SidebarContent 
            pathname={pathname} 
            isAdmin={isAdmin}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} isAdmin={isAdmin} />
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1 min-w-0" />
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link href="/dashboard/perfil">
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[120px]">{session?.user?.name}</span>
                  <span className="sm:hidden">{session?.user?.name?.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  pathname, 
  isAdmin,
  onClose 
}: { 
  pathname: string
  isAdmin: boolean
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-primary">Auditoría Obras</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
      </nav>
    </div>
  )
}

