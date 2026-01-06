# Guía de Deploy en Vercel

## Configuración de Variables de Entorno en Vercel

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### Variables Requeridas

1. **DATABASE_URL**
   - URL de conexión a MongoDB Atlas
   - Formato: `mongodb+srv://usuario:password@cluster.mongodb.net/nombre_db?retryWrites=true&w=majority`
   - Ejemplo: `mongodb+srv://user:pass@auditoriadb.jiyce57.mongodb.net/auditoria_obras?retryWrites=true&w=majority`

2. **NEXTAUTH_SECRET**
   - Secret para NextAuth.js
   - Generar con: `openssl rand -base64 32`
   - O usar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

3. **NEXTAUTH_URL**
   - URL de tu aplicación en Vercel
   - Formato: `https://tu-app.vercel.app`
   - Se configura automáticamente en Vercel, pero puedes sobrescribirlo si es necesario

### Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** → **Environment Variables**
3. Agrega cada variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Tu URL de MongoDB Atlas
   - **Environment**: Production, Preview, Development (selecciona todos)
4. Repite para `NEXTAUTH_SECRET` y `NEXTAUTH_URL` si es necesario

### Build Configuration

El proyecto ya está configurado para Vercel:

- ✅ `postinstall` script genera Prisma Client automáticamente
- ✅ `build` script incluye `prisma generate` antes del build
- ✅ `vercel.json` configurado con las opciones correctas

### Pasos para Deploy

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Preparado para Vercel"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar Variables de Entorno:**
   - En el dashboard de Vercel, ve a Settings → Environment Variables
   - Agrega `DATABASE_URL` y `NEXTAUTH_SECRET`

4. **Deploy:**
   - Vercel hará el deploy automáticamente
   - El build incluirá `prisma generate` automáticamente

### Solución de Problemas

#### Error: "Prisma Client not generated"
- ✅ Ya está solucionado con `postinstall` y `build` scripts
- Si persiste, verifica que `prisma` esté en `devDependencies`

#### Error: "DATABASE_URL not found"
- Verifica que la variable esté configurada en Vercel Dashboard
- Asegúrate de seleccionar todos los ambientes (Production, Preview, Development)

#### Error: "Connection to MongoDB failed"
- Verifica que la URL de MongoDB Atlas sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas (o usa `0.0.0.0/0` para permitir todas las IPs)

### Notas Importantes

- **MongoDB Atlas**: Asegúrate de que tu cluster permita conexiones desde cualquier IP (`0.0.0.0/0`) o agrega las IPs de Vercel
- **Prisma**: El cliente se genera automáticamente durante el build gracias al script `postinstall`
- **Variables de Entorno**: No subas archivos `.env` al repositorio, usa las variables de entorno de Vercel

### Verificación Post-Deploy

Después del deploy, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ Puedes iniciar sesión
3. ✅ Las conexiones a la base de datos funcionan
4. ✅ Los reportes se generan correctamente

