"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Key, Loader2 } from "lucide-react"
import { Role } from "@prisma/client"
import { formatDate } from "@/lib/utils"
import { showToast } from "@/components/ui/toast"
import { confirmDialog } from "@/components/ui/confirm-dialog"

interface Usuario {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

interface UsuariosClientProps {
  usuarios: Usuario[]
}

export function UsuariosClient({ usuarios: initialUsuarios }: UsuariosClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [changingPassword, setChangingPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "VIEWER" as Role,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingUser
        ? `/api/admin/usuarios/${editingUser.id}`
        : "/api/admin/usuarios"
      const method = editingUser ? "PUT" : "POST"

      const body: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      }
      if (!editingUser || formData.password) {
        body.password = formData.password
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al guardar usuario")
      }

      router.refresh()
      resetForm()
      showToast(
        editingUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        "success"
      )
    } catch (error: any) {
      showToast(error.message || "Error al guardar usuario", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Eliminar Usuario",
      message: "¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/usuarios/${id}`, {
            method: "DELETE",
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Error al eliminar usuario")
          }

          router.refresh()
          showToast("Usuario eliminado correctamente", "success")
        } catch (error: any) {
          showToast(error.message || "Error al eliminar usuario", "error")
        }
      },
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al eliminar usuario")
      }

      router.refresh()
      showToast("Usuario eliminado correctamente", "success")
    } catch (error: any) {
      showToast(error.message || "Error al eliminar usuario", "error")
    }
  }

  const handleChangePassword = async (id: string, newPassword: string) => {
    setChangingPassword(id)
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al cambiar contraseña")
      }

      showToast("Contraseña cambiada correctamente", "success")
    } catch (error: any) {
      showToast(error.message || "Error al cambiar contraseña", "error")
    } finally {
      setChangingPassword(null)
    }
  }

  const resetForm = () => {
    setFormData({ email: "", name: "", password: "", role: "VIEWER" })
    setEditingUser(null)
    setShowForm(false)
  }

  const startEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      email: usuario.email,
      name: usuario.name,
      password: "",
      role: usuario.role,
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administrar usuarios del sistema y asignar roles
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancelar" : "Nuevo Usuario"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!!editingUser}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editingUser ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <select
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as Role })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="VIEWER">Viewer (Solo lectura)</option>
                    <option value="ENGINEER">Engineer (Ingeniero)</option>
                    <option value="ACCOUNTANT">Accountant (Contador)</option>
                    <option value="ADMIN">Admin (Administrador)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado de Usuarios</CardTitle>
          <CardDescription>{usuarios.length} usuario(s) registrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length > 0 ? (
            <div className="space-y-2">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{usuario.name}</p>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {usuario.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Creado: {formatDate(usuario.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPassword = prompt("Ingrese la nueva contraseña:")
                        if (newPassword && newPassword.length >= 6) {
                          handleChangePassword(usuario.id, newPassword)
                        } else if (newPassword) {
                          alert("La contraseña debe tener al menos 6 caracteres")
                        }
                      }}
                      disabled={changingPassword === usuario.id}
                    >
                      {changingPassword === usuario.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(usuario)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

