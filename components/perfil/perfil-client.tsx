"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { formatDateTime } from "@/lib/utils"
import { Upload, X, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react"

interface ActividadLog {
  id: string
  accion: string
  detalle: string | null
  createdAt: Date
}

interface UserWithoutPassword {
  id: string
  email: string
  name: string
  role: Role
  fotoPerfil: string | null
  createdAt: Date
  updatedAt: Date
}

interface PerfilClientProps {
  user: UserWithoutPassword
  actividadLogs: ActividadLog[]
}

export function PerfilClient({ user, actividadLogs: initialLogs }: PerfilClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState(user.fotoPerfil)
  const [showAll, setShowAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["perfil-actividad", showAll ? currentPage : 1, showAll ? limit : 5],
    queryFn: async () => {
      const page = showAll ? currentPage : 1
      const pageLimit = showAll ? limit : 5
      const res = await fetch(`/api/perfil/actividad?page=${page}&limit=${pageLimit}`)
      if (!res.ok) throw new Error("Error al cargar actividad")
      return res.json()
    },
    initialData: showAll ? undefined : {
      logs: initialLogs,
      pagination: {
        page: 1,
        limit: 5,
        total: initialLogs.length,
        totalPages: 1,
      },
    },
  })

  const logs = data?.logs || initialLogs
  const pagination = data?.pagination

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "ENGINEER":
        return "Ingeniero / Líder Auditor"
      case "ACCOUNTANT":
        return "Contador"
      case "VIEWER":
        return "Consulta"
      default:
        return role
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/perfil/foto", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al subir foto")
      }

      const data = await res.json()
      setFotoPerfil(data.fotoPerfil)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al subir foto de perfil")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteFoto = async () => {
    if (!confirm("¿Está seguro de que desea eliminar su foto de perfil?")) {
      return
    }

    try {
      const res = await fetch("/api/perfil/foto", {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Error al eliminar foto")
      }

      setFotoPerfil(null)
      router.refresh()
    } catch (error) {
      alert("Error al eliminar foto de perfil")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Datos del usuario y actividad</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Usuario</CardTitle>
            <CardDescription>Información personal y de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {fotoPerfil ? (
                  <img
                    src={fotoPerfil}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileSelect}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Subiendo..." : "Cambiar Foto"}
                </Button>
                {fotoPerfil && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteFoto}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-base font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rol</label>
              <p className="text-base font-medium">{getRoleLabel(user.role)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de registro</label>
              <p className="text-base font-medium">
                {formatDateTime(user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permisos</CardTitle>
            <CardDescription>Permisos según tu rol (solo lectura)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {user.role === "ADMIN" && (
                <>
                  <p>✓ Acceso completo al sistema</p>
                  <p>✓ Gestión de usuarios y roles</p>
                  <p>✓ Eliminación definitiva de archivos</p>
                  <p>✓ Configuración de parámetros</p>
                </>
              )}
              {user.role === "ENGINEER" && (
                <>
                  <p>✓ Gestión de obras y procesos</p>
                  <p>✓ Procesos asignados a Ingeniero</p>
                  <p>✓ Subida y gestión de archivos</p>
                  <p>✗ Gestión de usuarios</p>
                </>
              )}
              {user.role === "ACCOUNTANT" && (
                <>
                  <p>✓ Gestión de obras y procesos</p>
                  <p>✓ Procesos asignados a Contador</p>
                  <p>✓ Subida y gestión de archivos</p>
                  <p>✗ Gestión de usuarios</p>
                </>
              )}
              {user.role === "VIEWER" && (
                <>
                  <p>✓ Visualización de obras</p>
                  <p>✓ Visualización de procesos</p>
                  <p>✓ Descarga de archivos</p>
                  <p>✗ Modificación de datos</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Actividad Personal</CardTitle>
              <CardDescription>
                {showAll
                  ? `Registro completo de actividad (${pagination?.total || 0} total)`
                  : "Últimas acciones realizadas"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando actividad...
            </div>
          ) : logs && logs.length > 0 ? (
            <>
              <div className="space-y-2">
                {logs.map((log: ActividadLog) => (
                  <div
                    key={log.id}
                    className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{log.accion}</p>
                        {log.detalle && (
                          <p className="text-sm text-muted-foreground">{log.detalle}</p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!showAll && pagination && pagination.total > 5 && (
                <div className="mt-4 pt-4 border-t flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAll(true)
                      setCurrentPage(1)
                    }}
                  >
                    Ver Registro de Actividad Completo ({pagination.total})
                  </Button>
                </div>
              )}
              {showAll && pagination && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage >= pagination.totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay actividad registrada aún
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

