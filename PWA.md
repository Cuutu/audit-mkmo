# Progressive Web App (PWA) - Guía de Uso

## ¿Qué es una PWA?

Una Progressive Web App (PWA) es una aplicación web que puede instalarse en dispositivos móviles y de escritorio como si fuera una aplicación nativa, sin necesidad de publicarla en tiendas de aplicaciones como Google Play Store o Apple App Store.

## Características Implementadas

✅ **Instalable**: Los usuarios pueden instalar la app directamente desde el navegador
✅ **Funcionalidad Offline**: Service Worker para cachear recursos y funcionar sin conexión
✅ **Iconos**: Iconos personalizados para la pantalla de inicio
✅ **Pantalla Completa**: Se ejecuta en modo standalone (sin barra del navegador)
✅ **Notificación de Instalación**: Banner automático para invitar a instalar

## Cómo Instalar la PWA

### En Android (Chrome/Edge)

1. Abre la aplicación en tu navegador móvil
2. Verás un banner en la parte inferior que dice "Instalar App"
3. Toca el botón "Instalar"
4. Confirma la instalación
5. La app aparecerá en tu pantalla de inicio como una aplicación nativa

**Alternativa manual:**
- Menú del navegador (⋮) → "Agregar a pantalla de inicio" o "Instalar app"

### En iOS (Safari)

1. Abre la aplicación en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. Personaliza el nombre si lo deseas
5. Toca "Agregar"
6. La app aparecerá en tu pantalla de inicio

### En Desktop (Chrome/Edge)

1. Abre la aplicación en tu navegador
2. Busca el icono de instalación (➕) en la barra de direcciones
3. Haz clic en "Instalar"
4. Confirma la instalación
5. La app se abrirá en una ventana independiente

## Archivos PWA Creados

- `app/manifest.ts` - Configuración del manifest (Next.js lo convierte automáticamente)
- `public/sw.js` - Service Worker para funcionalidad offline
- `public/icon-192.png` - Icono 192x192px
- `public/icon-512.png` - Icono 512x512px
- `components/pwa/pwa-install.tsx` - Componente de instalación

## Personalización

### Cambiar los Iconos

1. Crea tus propios iconos en tamaños 192x192 y 512x512 píxeles
2. Reemplaza los archivos en `public/`:
   - `icon-192.png`
   - `icon-512.png`
3. O ejecuta el script para regenerar:
   ```bash
   node scripts/generate-icons.js
   ```

### Modificar el Manifest

Edita `app/manifest.ts` para cambiar:
- Nombre de la app
- Colores del tema
- URL de inicio
- Accesos directos (shortcuts)

### Actualizar el Service Worker

Edita `public/sw.js` para:
- Cambiar la estrategia de caché
- Agregar más recursos al caché
- Modificar el comportamiento offline

## Verificar PWA

### Chrome DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. Revisa:
   - **Manifest**: Debe mostrar la configuración correcta
   - **Service Workers**: Debe estar registrado y activo
   - **Storage**: Verifica el caché

### Lighthouse

1. Abre DevTools → Lighthouse
2. Selecciona "Progressive Web App"
3. Ejecuta el análisis
4. Debe obtener una puntuación alta en PWA

## Notas Importantes

- **HTTPS Requerido**: Las PWAs solo funcionan en HTTPS (o localhost en desarrollo)
- **Service Worker**: Se registra automáticamente al cargar la página
- **Actualizaciones**: El Service Worker se actualiza automáticamente cuando cambias `sw.js`
- **Iconos**: Los iconos deben ser PNG con tamaños específicos (192x192 y 512x512)

## Solución de Problemas

### La app no se puede instalar

- Verifica que estés usando HTTPS (o localhost)
- Asegúrate de que el manifest esté accesible en `/manifest.webmanifest`
- Revisa la consola del navegador para errores

### El Service Worker no funciona

- Verifica que `sw.js` esté en la carpeta `public/`
- Revisa la consola para errores de registro
- Limpia el caché del navegador y vuelve a intentar

### Los iconos no aparecen

- Verifica que los archivos PNG existan en `public/`
- Asegúrate de que los tamaños sean correctos (192x192 y 512x512)
- Revisa las rutas en `app/manifest.ts`

## Próximos Pasos

Para mejorar la PWA, puedes agregar:

- **Notificaciones Push**: Para alertas en tiempo real
- **Sincronización en Background**: Para actualizar datos cuando la app está cerrada
- **Modo Offline Completo**: Para trabajar completamente sin conexión
- **Actualización Automática**: Para notificar cuando hay una nueva versión disponible

