# Sistema de Auditoría de Obras

Sistema completo para la gestión y auditoría de obras con seguimiento de 8 procesos.

## 🚀 Tecnologías Utilizadas

- **Next.js 14+** - Framework React con App Router
- **TypeScript** - Type safety
- **MongoDB** - Base de datos NoSQL flexible y escalable
- **Prisma** - ORM moderno y type-safe
- **NextAuth.js** - Autenticación y autorización
- **Tailwind CSS** - Estilos modernos
- **React Hook Form + Zod** - Formularios y validación
- **Recharts** - Gráficos y visualizaciones
- **React Query** - Gestión de estado del servidor

## 📋 Requisitos Previos

- Node.js 18+ 
- MongoDB (local o remoto)
- npm o yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Editar `.env` y configurar:
- `DATABASE_URL` - URL de conexión a MongoDB (ej: `mongodb://localhost:27017/auditoria_obras`)
- `NEXTAUTH_SECRET` - Generar con: `openssl rand -base64 32`

3. **Configurar base de datos:**
```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con MongoDB (no requiere crear BD manualmente)
npm run db:push
```

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas
│   └── api/               # API routes
├── components/            # Componentes React
├── lib/                   # Utilidades y configuraciones
├── prisma/                # Esquema y migraciones
└── public/                # Archivos estáticos
```

## 🔐 Roles del Sistema

- **ADMIN** - Acceso completo, puede eliminar definitivamente
- **ENGINEER** - Responsable de procesos de ingeniería
- **ACCOUNTANT** - Responsable de procesos contables
- **VIEWER** - Solo lectura

## 📊 Procesos de Obra

1. Definición técnica de la obra
2. Proyecto / costo proyectado / cronograma
3. Constatación (planos / revisiones / fotos)
4. Método de redeterminación / desglose económico
5. Materiales involucrados
6. Mano de obra involucrada
7. Creación de base de datos
8. Análisis de resultados

## 🔍 Características Principales

- ✅ CRUD completo de obras
- ✅ Búsqueda y filtros avanzados
- ✅ Gestión de 8 procesos por obra
- ✅ Sistema de archivos con versionado
- ✅ Papelera y recuperación
- ✅ Bitácora completa (Audit Log)
- ✅ Reportes por obra y globales
- ✅ Dashboard con KPIs
- ✅ Sistema de roles y permisos

## 📝 Scripts Disponibles

- `npm run dev` - Desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:push` - Sincronizar esquema con MongoDB
- `npm run db:studio` - Abrir Prisma Studio

## 🔒 Seguridad

- Autenticación con NextAuth.js
- Contraseñas hasheadas con bcrypt
- Validación de roles en cada acción
- Audit log completo de todas las operaciones
- Borrado lógico por defecto

## 📄 Licencia

Privado - Uso interno

