# Configuración de Base de Datos

## MongoDB - Base de Datos NoSQL

Este proyecto utiliza **MongoDB** como base de datos. MongoDB es una excelente opción para este tipo de aplicaciones por:

### Ventajas de MongoDB

1. **Flexibilidad**: Esquema flexible que se adapta a cambios
2. **JSON Nativo**: Perfecto para datos estructurados como checklists y datos de procesos
3. **Escalabilidad Horizontal**: Fácil escalar agregando más servidores
4. **Rendimiento**: Excelente para lecturas y escrituras rápidas
5. **Desarrollo Rápido**: No requiere migraciones complejas de esquema
6. **Documentos Anidados**: Ideal para estructuras jerárquicas

## Verificar Instalación de MongoDB

### Windows

```bash
# Verificar que MongoDB esté corriendo
mongod --version

# Iniciar MongoDB (si no está corriendo como servicio)
mongod
```

### macOS

```bash
# Con Homebrew
brew services list | grep mongodb
brew services start mongodb-community

# Verificar versión
mongod --version
```

### Linux (Ubuntu/Debian)

```bash
# Verificar estado
sudo systemctl status mongod

# Iniciar si no está corriendo
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Configuración Inicial

### 1. Verificar que MongoDB esté corriendo

Abre una terminal y ejecuta:

```bash
mongosh
```

Si se conecta correctamente, verás algo como:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000
Using MongoDB: 7.0.x
Using Mongosh: 2.x.x
```

### 2. Configurar variable de entorno

Crear o editar el archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="mongodb://localhost:27017/auditoria_obras"
```

O si MongoDB requiere autenticación:

```env
DATABASE_URL="mongodb://usuario:contraseña@localhost:27017/auditoria_obras?authSource=admin"
```

### 3. Configurar Prisma

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con MongoDB (no usa migraciones tradicionales)
npm run db:push

# (Opcional) Ejecutar seed para crear usuario admin
npm run db:seed
```

## Diferencias con PostgreSQL

### MongoDB con Prisma

- ✅ **No requiere migraciones**: Usa `db:push` para sincronizar esquema
- ✅ **IDs automáticos**: MongoDB genera ObjectIds automáticamente
- ✅ **JSON nativo**: Los campos `Json` funcionan perfectamente
- ⚠️ **Sin foreign keys**: Las relaciones son referencias, no constraints
- ⚠️ **Sin cascadas automáticas**: Se manejan en la aplicación

### Comandos Prisma para MongoDB

```bash
# Sincronizar esquema (equivalente a migrate)
npm run db:push

# Generar cliente
npm run db:generate

# Abrir Prisma Studio
npm run db:studio
```

## Herramientas Recomendadas

- **MongoDB Compass**: Interfaz gráfica oficial de MongoDB
- **Prisma Studio**: `npm run db:studio` - Interfaz web para ver datos
- **MongoDB Shell (mongosh)**: Terminal interactivo

## Estructura de Datos en MongoDB

MongoDB organiza los datos en:
- **Database**: `auditoria_obras`
- **Collections**: 
  - `users`
  - `obras`
  - `procesos`
  - `archivos`
  - `audit_logs`
  - `actividad_logs`
  - `parametros`
  - `checklist_templates`

## Backup y Restauración

### Backup

```bash
# Backup completo de la base de datos
mongodump --db=auditoria_obras --out=./backup

# Backup de una colección específica
mongodump --db=auditoria_obras --collection=obras --out=./backup
```

### Restauración

```bash
# Restaurar base de datos completa
mongorestore --db=auditoria_obras ./backup/auditoria_obras

# Restaurar una colección
mongorestore --db=auditoria_obras --collection=obras ./backup/auditoria_obras/obras.bson
```

## Producción

Para producción, considera:

1. **Hosting Managed**: 
   - MongoDB Atlas (recomendado)
   - AWS DocumentDB
   - Azure Cosmos DB
   - DigitalOcean Managed MongoDB

2. **Configuración**:
   - Habilitar autenticación
   - Configurar backups automáticos
   - Habilitar replicación (replica sets)
   - Configurar índices para performance
   - Usar conexiones SSL/TLS

### MongoDB Atlas (Recomendado para Producción)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster (gratis disponible)
3. Obtener connection string
4. Configurar en `.env`:
   ```env
   DATABASE_URL="mongodb+srv://usuario:contraseña@cluster.mongodb.net/auditoria_obras?retryWrites=true&w=majority"
   ```

## Solución de Problemas

### MongoDB no se conecta

```bash
# Verificar que el servicio esté corriendo
# Windows: Servicios > MongoDB
# Linux/Mac: sudo systemctl status mongod
```

### Error de autenticación

- Verificar usuario y contraseña en `DATABASE_URL`
- Si usas MongoDB local sin auth, asegúrate de que la URL no incluya credenciales

### Error de permisos

- Verificar que el usuario tenga permisos de lectura/escritura
- En MongoDB local sin auth, no debería haber problemas

## Ventajas para este Proyecto

1. **Checklists y Datos Estructurados**: Los campos `Json` en Prisma se mapean perfectamente a documentos MongoDB
2. **Versionado de Archivos**: Fácil manejar versiones como documentos relacionados
3. **Audit Logs**: Los logs se almacenan eficientemente como documentos
4. **Escalabilidad**: Si creces, MongoDB escala horizontalmente fácilmente
