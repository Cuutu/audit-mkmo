import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No se puede ejecutar seed en producción. Use migraciones o scripts específicos."
    )
  }

  console.log("🌱 Iniciando seed...")

  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD son requeridos. Definirlos en .env"
    )
  }

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

    console.log("✅ Usuario admin creado:", adminEmail)
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

