// Este archivo se importa primero para asegurar que las variables de entorno estén cargadas
if (typeof window === 'undefined') {
  // Solo en el servidor
  const dotenv = require('dotenv')
  const path = require('path')
  const fs = require('fs')
  
  // Verificar que los archivos existan
  const envLocalPath = path.resolve(process.cwd(), '.env.local')
  const envPath = path.resolve(process.cwd(), '.env')
  
  // Cargar .env.local primero (tiene prioridad), luego .env
  if (fs.existsSync(envLocalPath)) {
    const result = dotenv.config({ path: envLocalPath })
    if (result.error) {
      console.error('❌ Error cargando .env.local:', result.error)
    } else {
      console.log(`✅ Cargado .env.local (${Object.keys(result.parsed || {}).length} variables)`)
    }
  }
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath, override: false })
    if (result.error) {
      console.error('❌ Error cargando .env:', result.error)
    } else {
      console.log(`✅ Cargado .env (${Object.keys(result.parsed || {}).length} variables)`)
    }
  } else {
    // En producción (Vercel), las variables de entorno se configuran directamente
    // No es un error si no existe el archivo .env
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Archivo .env no encontrado en:', envPath)
    }
  }
  
  // Log para debug (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Variables de entorno cargadas')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? `✅ Definida (${process.env.DATABASE_URL.substring(0, 30)}...)` : '❌ No definida')
  }
}

export {}
