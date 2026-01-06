# Guía de Configuración Inicial

## Pasos para Configurar el Proyecto

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos MongoDB

Ver [DATABASE.md](./DATABASE.md) para instrucciones detalladas.

Resumen rápido:
1. Verificar que MongoDB esté instalado y corriendo
2. Configurar `DATABASE_URL` en `.env`:
   ```env
   DATABASE_URL="mongodb://localhost:27017/auditoria_obras"
   ```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/auditoria_obras?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"

# Archivos
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"
```

**Generar NEXTAUTH_SECRET:**
```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32
```

### 4. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con MongoDB (no usa migraciones)
npm run db:push

# Crear usuario admin inicial
npm run db:seed
```

### 5. Crear Directorio de Uploads

```bash
mkdir uploads
```

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 7. Login Inicial

- **Email**: `admin@auditoria.com`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Cambiar la contraseña después del primer login.

## Estructura de Carpetas

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas públicas (login, recuperar password)
│   ├── (dashboard)/       # Rutas protegidas
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── layout/           # Componentes de layout
│   ├── obras/            # Componentes de obras
│   └── procesos/         # Componentes de procesos
├── lib/                   # Utilidades y configuraciones
├── prisma/                # Esquema y migraciones
├── scripts/               # Scripts de utilidad
└── public/                # Archivos estáticos
```

## Comandos Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:seed` - Ejecutar seed inicial

## Próximos Pasos

1. ✅ Configurar base de datos
2. ✅ Crear usuario admin
3. ✅ Probar login
4. ⏭️ Crear primera obra
5. ⏭️ Configurar procesos
6. ⏭️ Subir archivos de prueba

## Solución de Problemas

### Error de conexión a base de datos
- Verificar que MongoDB esté corriendo (`mongosh` para probar)
- Verificar `DATABASE_URL` en `.env`
- Verificar credenciales si MongoDB tiene autenticación habilitada

### Error de sincronización
- Asegurarse de que MongoDB esté corriendo
- Verificar permisos del usuario
- Ejecutar `npm run db:generate` primero
- Usar `npm run db:push` en lugar de `db:migrate` (MongoDB no usa migraciones tradicionales)

### Error de autenticación
- Verificar `NEXTAUTH_SECRET` en `.env`
- Verificar `NEXTAUTH_URL` coincide con la URL de la app

