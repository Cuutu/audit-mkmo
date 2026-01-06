// Script para generar iconos PWA
// Requiere: npm install sharp
// Uso: node scripts/generate-icons.js

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Crear iconos SVG simples
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">AO</text>
</svg>`
}

// Crear iconos PNG
async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public')

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const sizes = [192, 512]

  for (const size of sizes) {
    const svg = createSVGIcon(size)
    const svgBuffer = Buffer.from(svg)
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`))
    
    console.log(`✅ Generado: icon-${size}.png`)
  }

  console.log('\n🎉 Todos los iconos PWA han sido generados correctamente!')
}

generateIcons().catch(console.error)

