import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Settings, FileText } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="text-muted-foreground">Panel de administración del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Usuarios y Roles</CardTitle>
            <CardDescription>
              Gestionar usuarios del sistema y asignar roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/usuarios">
              <Button className="w-full">Gestionar Usuarios</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Parámetros</CardTitle>
            <CardDescription>
              Configurar parámetros y catálogos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/parametros">
              <Button className="w-full">Configurar Parámetros</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Plantillas</CardTitle>
            <CardDescription>
              Gestionar plantillas de checklist por proceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/plantillas">
              <Button className="w-full">Gestionar Plantillas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

