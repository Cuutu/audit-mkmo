"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Role } from "@prisma/client"
import { formatDateTime } from "@/lib/utils"

interface ActividadLog {
  id: string
  accion: string
  detalle: string | null
  createdAt: Date
}

interface PerfilClientProps {
  user: User
  actividadLogs: ActividadLog[]
}

export function PerfilClient({ user, actividadLogs }: PerfilClientProps) {
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

