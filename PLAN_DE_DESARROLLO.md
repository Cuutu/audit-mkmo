# 📋 Plan de Desarrollo - Sistema de Auditoría de Obras

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### A. Acceso y Sesión
- ✅ Login funcional
- ✅ Recuperar contraseña (página básica, falta integración email)
- ✅ Perfil con datos, rol y historial de actividad

### B. Dashboard
- ✅ Dashboard con KPIs básicos
- ✅ Accesos directos (Nueva obra, Buscar, Reportes)
- ⚠️ Falta: Etapas atrasadas por responsable

### C. Obras
- ✅ Listado y búsqueda de obras
- ✅ Filtros por año/mes/estado
- ✅ Semáforos de procesos
- ✅ Nueva obra
- ❌ **FALTA: Editar obra**
- ❌ **FALTA: Adjuntar carátula en nueva obra**

### D. Detalle de Obra
- ✅ Vista 360 con stepper de procesos
- ✅ Tabs: Resumen, Procesos, Archivos, Bitácora, Reportes
- ✅ Colores por responsable (Rojo/Negro/Azul)

### E. Procesos
- ✅ Página de detalle de proceso
- ✅ Estado y avance
- ✅ Observaciones
- ❌ **FALTA: Checklist de requeridos (UI)**
- ❌ **FALTA: Campos estructurados por proceso (UI)**
- ❌ **FALTA: Firma/validación**
- ❌ **FALTA: Historial de cambios del proceso**

### F. Archivos
- ✅ Estructura en BD (versionado, carpetas)
- ✅ API de subida
- ❌ **FALTA: Componente de subida de archivos (drag & drop)**
- ❌ **FALTA: Descarga de archivos**
- ❌ **FALTA: Previsualización de archivos**
- ❌ **FALTA: Papelera/Recuperación (UI completa)**
- ✅ Bitácora básica

### G. Reportes
- ✅ Estructura básica
- ❌ **FALTA: Generación de PDF**
- ❌ **FALTA: Generación de Excel**
- ❌ **FALTA: Diagrama de flujo**
- ❌ **FALTA: Gráficos y cuadros**
- ❌ **FALTA: Matriz de control**
- ❌ **FALTA: Reportes globales funcionales**

### H. Administración
- ✅ Panel básico
- ❌ **FALTA: CRUD completo de usuarios**
- ❌ **FALTA: Gestión de parámetros**
- ❌ **FALTA: Gestión de plantillas de checklist**

---

## 🎯 PLAN DE DESARROLLO POR PASOS

### **FASE 1: Funcionalidades Críticas de Obras** (Prioridad Alta)

#### Paso 1.1: Editar Obra
- [ ] Crear página `/dashboard/obras/[id]/editar`
- [ ] Formulario de edición (similar a nueva obra)
- [ ] API PUT `/api/obras/[id]`
- [ ] Validación y actualización de audit log

#### Paso 1.2: Subida de Archivos Funcional
- [ ] Componente `FileUpload` con drag & drop
- [ ] Integrar en tab de Archivos
- [ ] Integrar en detalle de Proceso
- [ ] Validación de tipos y tamaños
- [ ] Feedback visual de progreso

#### Paso 1.3: Descarga de Archivos
- [ ] API GET `/api/archivos/[id]/download`
- [ ] Botón de descarga funcional
- [ ] Manejo de errores

#### Paso 1.4: Adjuntar Carátula en Nueva Obra
- [ ] Agregar campo de archivo en formulario de nueva obra
- [ ] Subir carátula al crear obra
- [ ] Mostrar carátula en detalle de obra

---

### **FASE 2: Funcionalidades de Procesos** (Prioridad Alta)

#### Paso 2.1: Checklist de Requeridos
- [ ] Componente `ChecklistEditor` reutilizable
- [ ] Cargar plantilla de checklist por proceso
- [ ] Guardar checklist en campo JSON del proceso
- [ ] Mostrar checklist en detalle de proceso
- [ ] Marcar items como completados

#### Paso 2.2: Campos Estructurados por Proceso
- [ ] Componente `ProcesoFields` dinámico
- [ ] Definir estructura de campos por proceso (1-8)
- [ ] Editor de campos estructurados
- [ ] Guardar en campo `datos` (JSON) del proceso
- [ ] Validación según tipo de campo

#### Paso 2.3: Historial de Cambios del Proceso
- [ ] Filtrar audit logs por proceso
- [ ] Mostrar en tab o sección del proceso
- [ ] Formato legible de cambios

#### Paso 2.4: Firma/Validación (Opcional - Baja Prioridad)
- [ ] Campo de firma en proceso
- [ ] Validación de aprobación
- [ ] Restricciones según rol

---

### **FASE 3: Archivos y Papelera** (Prioridad Media)

#### Paso 3.1: Previsualización de Archivos
- [ ] Detectar tipo de archivo (PDF, imagen, etc.)
- [ ] Componente de previsualización
- [ ] Modal para ver archivos

#### Paso 3.2: Papelera Completa
- [ ] Página `/dashboard/papelera`
- [ ] Listar archivos eliminados (borrado lógico)
- [ ] Botón restaurar
- [ ] Botón eliminar definitivo (solo Admin)
- [ ] API para restaurar y eliminar definitivo

#### Paso 3.3: Versionado Visual
- [ ] Mostrar historial de versiones
- [ ] Permitir ver/descargar versiones anteriores
- [ ] Indicador visual de versión actual

---

### **FASE 4: Dashboard Mejorado** (Prioridad Media)

#### Paso 4.1: Etapas Atrasadas
- [ ] Query para detectar procesos atrasados
- [ ] Criterio: procesos en curso > X días sin actualizar
- [ ] Mostrar en Dashboard con filtro por responsable
- [ ] Link directo a proceso atrasado

#### Paso 4.2: KPIs Mejorados
- [ ] Gráficos con Recharts
- [ ] Obras por mes/año (gráfico de barras)
- [ ] Distribución por estado (gráfico de torta)
- [ ] Tendencias de avance

---

### **FASE 5: Reportes Funcionales** (Prioridad Media)

#### Paso 5.1: Librería de Generación de PDF
- [ ] Instalar `jsPDF` o `puppeteer`
- [ ] Crear template base de reporte
- [ ] Componente para generar PDF

#### Paso 5.2: Reporte Completo por Obra
- [ ] Template con todos los datos de la obra
- [ ] Incluir procesos y estados
- [ ] Incluir archivos adjuntos (lista)
- [ ] Generar y descargar PDF

#### Paso 5.3: Diagrama de Flujo
- [ ] Usar librería de diagramas (mermaid, react-flow, etc.)
- [ ] Generar diagrama de procesos 1-8
- [ ] Incluir en reporte PDF

#### Paso 5.4: Gráficos y Cuadros
- [ ] Gráfico de avance por proceso
- [ ] Cuadro resumen de estados
- [ ] Incluir en reporte PDF

#### Paso 5.5: Matriz de Control
- [ ] Tabla con procesos vs responsables
- [ ] Estados y fechas
- [ ] Incluir en reporte PDF

#### Paso 5.6: Reportes Globales
- [ ] Página de reportes globales
- [ ] Filtros por mes/año/estado
- [ ] Generar reporte consolidado
- [ ] Exportar a PDF/Excel

#### Paso 5.7: Exportación a Excel
- [ ] Instalar `xlsx` o similar
- [ ] Generar Excel con datos
- [ ] Múltiples hojas si es necesario

---

### **FASE 6: Administración Completa** (Prioridad Media)

#### Paso 6.1: CRUD de Usuarios
- [ ] Página `/dashboard/admin/usuarios`
- [ ] Listado de usuarios
- [ ] Crear usuario
- [ ] Editar usuario (incluyendo rol)
- [ ] Eliminar usuario (borrado lógico)
- [ ] Cambiar contraseña
- [ ] Validaciones y permisos

#### Paso 6.2: Gestión de Parámetros
- [ ] Página `/dashboard/admin/parametros`
- [ ] Listado de parámetros
- [ ] Crear/editar parámetros
- [ ] Categorías de parámetros
- [ ] Validación de tipos

#### Paso 6.3: Gestión de Plantillas de Checklist
- [ ] Página `/dashboard/admin/plantillas`
- [ ] Listado de plantillas por proceso
- [ ] Editor de plantillas
- [ ] Activar/desactivar plantillas
- [ ] Aplicar plantilla a procesos existentes

---

### **FASE 7: Mejoras y Pulido** (Prioridad Baja)

#### Paso 7.1: Recuperar Contraseña Funcional
- [ ] Integrar servicio de email (Resend, SendGrid, etc.)
- [ ] Generar token de recuperación
- [ ] Página de reset de contraseña
- [ ] Validar token y permitir cambio

#### Paso 7.2: Filtro por Responsable en Listado
- [ ] Agregar filtro en página de obras
- [ ] Query para filtrar por responsable del proceso

#### Paso 7.3: Mejoras de UX
- [ ] Loading states mejorados
- [ ] Mensajes de error más claros
- [ ] Confirmaciones para acciones destructivas
- [ ] Notificaciones de éxito/error

#### Paso 7.4: Optimizaciones
- [ ] Paginación en listados grandes
- [ ] Lazy loading de imágenes
- [ ] Cache de queries
- [ ] Optimización de queries de BD

---

## 📊 RESUMEN DE PRIORIDADES

### 🔴 **ALTA PRIORIDAD** (Hacer primero)
1. Editar Obra
2. Subida de Archivos Funcional
3. Descarga de Archivos
4. Checklist de Requeridos
5. Campos Estructurados por Proceso

### 🟡 **MEDIA PRIORIDAD** (Hacer después)
6. Papelera Completa
7. Previsualización de Archivos
8. Etapas Atrasadas
9. Reportes Funcionales (PDF)
10. Administración Completa

### 🟢 **BAJA PRIORIDAD** (Mejoras)
11. Recuperar Contraseña Funcional
12. Firma/Validación
13. Exportación a Excel
14. Optimizaciones

---

## 🛠️ TECNOLOGÍAS A AGREGAR

```json
{
  "dependencies": {
    "react-dropzone": "^14.2.0",        // Drag & drop de archivos
    "jspdf": "^2.5.1",                   // Generación de PDF
    "jspdf-autotable": "^3.8.0",        // Tablas en PDF
    "xlsx": "^0.18.5",                   // Exportación a Excel
    "react-flow-renderer": "^10.3.0",   // Diagramas de flujo
    "recharts": "^2.12.0"                // Ya está, usar para gráficos
  }
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Orden sugerido**: Completar Fase 1 y 2 primero (funcionalidades críticas)
2. **Testing**: Probar cada funcionalidad antes de pasar a la siguiente
3. **Audit Log**: Asegurar que todas las acciones queden registradas
4. **Permisos**: Validar permisos en cada acción según rol
5. **Validaciones**: Validar datos en frontend y backend

---

## 🎯 ESTIMACIÓN DE TIEMPO

- **Fase 1**: 2-3 días
- **Fase 2**: 3-4 días
- **Fase 3**: 2 días
- **Fase 4**: 1-2 días
- **Fase 5**: 4-5 días
- **Fase 6**: 3-4 días
- **Fase 7**: 2-3 días

**Total estimado**: 17-23 días de desarrollo 

---

¡Listo para empezar! 🚀

