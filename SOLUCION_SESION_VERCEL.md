# Solución: Problema de Sesión en Vercel

## Problema
El login es exitoso pero la sesión no se mantiene, causando redirects infinitos.

## Solución

### 1. Configurar NEXTAUTH_URL en Vercel (CRÍTICO)

**Este es el paso más importante.** NextAuth necesita saber la URL exacta de tu aplicación.

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://auditoria-mkmo.vercel.app` (tu URL exacta, sin barra final)
   - **Environment**: Production, Preview, Development (todos)

### 2. Verificar Variables de Entorno

Asegúrate de tener configuradas estas variables en Vercel:

- ✅ `DATABASE_URL` - Tu URL de MongoDB Atlas
- ✅ `NEXTAUTH_SECRET` - Secret generado (32+ caracteres)
- ✅ `NEXTAUTH_URL` - `https://auditoria-mkmo.vercel.app` (sin barra final)

### 3. Verificar que el Usuario Admin Exista

Ejecuta el seed en producción o crea el usuario manualmente:

```bash
# Si tienes acceso a la base de datos directamente
# O ejecuta el seed si tienes acceso SSH a Vercel
```

El usuario admin debería ser:
- Email: `admin@auditoria.com`
- Password: `admin123`

### 4. Después de Configurar las Variables

1. **Redeploy la aplicación** en Vercel (o haz un nuevo commit)
2. **Limpia las cookies** del navegador para esa URL
3. **Intenta iniciar sesión nuevamente**

### 5. Verificar en los Logs de Vercel

Después del login, deberías ver en los logs:
- ✅ `Login exitoso: admin@auditoria.com`
- ✅ La sesión debería persistir

Si ves errores sobre cookies o sesión, verifica:
- Que `NEXTAUTH_URL` esté configurado correctamente
- Que `NEXTAUTH_SECRET` esté configurado
- Que la URL en `NEXTAUTH_URL` coincida exactamente con tu dominio de Vercel

## Debug Adicional

Si el problema persiste, puedes habilitar el modo debug temporalmente:

1. Agrega en Vercel: `NODE_ENV=development` (solo para debug)
2. Esto mostrará más información en los logs
3. **Recuerda quitarlo después** porque puede exponer información sensible

## Verificación

Después de configurar todo:

1. ✅ Login exitoso
2. ✅ Redirección a `/dashboard`
3. ✅ La sesión persiste al recargar la página
4. ✅ No hay redirects infinitos

