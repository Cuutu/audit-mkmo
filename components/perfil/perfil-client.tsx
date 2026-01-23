"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { formatDateTime } from "@/lib/utils"
import { Upload, X, User as UserIcon } from "lucide-react"

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

export function PerfilClient({ user, actividadLogs }: PerfilClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState(user.fotoPerfil)

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
          <CardTitle>Historial de Actividad Personal</CardTitle>
          <CardDescription>Registro de tus modificaciones y acciones</CardDescription>
        </CardHeader>
        <CardContent>
          {actividadLogs.length > 0 ? (
            <div className="space-y-2">
              {actividadLogs.map((log) => (
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

