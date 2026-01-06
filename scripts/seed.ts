import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Crear usuario admin por defecto
  const adminEmail = "admin@auditoria.com"
  const adminPassword = "admin123" // Cambiar en producción

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrador",
        role: "ADMIN",
      },
    })

    console.log("✅ Usuario admin creado:")
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log("   ⚠️  IMPORTANTE: Cambiar la contraseña después del primer login")
  } else {
    console.log("ℹ️  Usuario admin ya existe")
  }

  // Crear algunos parámetros por defecto
  const parametros = [
    {
      clave: "MAX_FILE_SIZE",
      valor: "10485760", // 10MB
      tipo: "number",
      descripcion: "Tamaño máximo de archivo en bytes",
      categoria: "archivo",
    },
    {
      clave: "ALLOWED_FILE_TYPES",
      valor: "pdf,doc,docx,xls,xlsx,jpg,jpeg,png",
      tipo: "string",
      descripcion: "Tipos de archivo permitidos",
      categoria: "archivo",
    },
  ]

  for (const param of parametros) {
    await prisma.parametro.upsert({
      where: { clave: param.clave },
      update: {},
      create: param,
    })
  }

  console.log("✅ Parámetros creados")

  console.log("✨ Seed completado!")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

