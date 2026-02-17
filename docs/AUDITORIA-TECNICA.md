# Auditoría Técnica Completa — Programa Auditoría Obras

**Fecha:** Febrero 2025 | **Auditor:** Tech Lead | **Estado:** Producción prevista

---

## 1. MAPA DEL PROYECTO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  app/                                                                        │
│  ├── (auth)/          login, recuperar-password, reset-password              │
│  ├── (dashboard)/     obras, procesos, reportes, papelera, perfil, admin    │
│  └── layout.tsx       Next.js App Router                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  components/          UI (proceso-detalle, obra-*, archivos, etc.)          │
│  middleware.ts        next-auth, protección rutas admin                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTES (Backend)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  /api/obras              GET (list+filter), POST (create)                    │
│  /api/obras/[id]         GET, PUT, DELETE                                    │
│  /api/obras/[id]/archivos, upload, bitacora, reporte                        │
│  /api/procesos/[id]      GET, PATCH                                          │
│  /api/archivos/[id]      GET (download), DELETE, PATCH (restore)            │
│  /api/auth/forgot-password, reset-password                                  │
│  /api/admin/usuarios, parametros, plantillas                                │
│  /api/reportes/global    Excel sin límite                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE DATOS / SERVICIOS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  lib/prisma.ts          Cliente Prisma (MongoDB)                             │
│  lib/auth.ts            NextAuth CredentialsProvider                        │
│  lib/file-upload.ts     Vercel Blob (put, del)                               │
│  lib/audit.ts           AuditLog, ActividadLog                               │
│  lib/periodos-config    Config procesos/períodos                            │
│  lib/proceso-fields     Campos por proceso                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  MongoDB (Prisma)  │  Vercel Blob (archivos)  │  NextAuth JWT (sesión)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Dependencias externas:** MongoDB, Vercel Blob (`BLOB_READ_WRITE_TOKEN`), Google Maps API (opcional).

---

## 2. TOP 15 RIESGOS FUTUROS

| # | Riesgo | Impacto (1-5) | Prob. (1-5) | Evidencia | Fix recomendado |
|---|--------|---------------|-------------|-----------|-----------------|
| 1 | **Archivos descargables por cualquier usuario autenticado** | 5 | 4 | `api/archivos/[id]/download/route.ts` — no verifica acceso a la obra | Validar que el usuario tenga permiso sobre la obra del archivo (ej. pertenece a obras visibles para su rol) |
| 2 | **OOM en reporte global y GET obras 2022-2023** | 5 | 4 | `api/reportes/global/route.ts` L51: `findMany` sin límite. `api/obras/route.ts` L129: segunda query sin `take` carga todas las obras en memoria | Límite + paginación en reportes; simplificar query 2022-2023 o limitar resultados |
| 3 | **Credenciales seed en código** | 5 | 2 | `scripts/seed.ts` L11-12: `admin@auditoria.com` / `admin123` hardcodeados | Variables de entorno o script que rechace ejecución en prod |
| 4 | **Sin rate limiting** | 4 | 5 | Ningún endpoint tiene rate limit | Middleware o Vercel KV para limitar requests por IP/user |
| 5 | **Logs sensibles en producción** | 4 | 4 | `api/auth`: `console.log` con emails. `api/obras` L81-84: `console.log` de filtros/where | Remover/condicionar logs en prod |
| 6 | **Token reset en response (dev)** | 4 | 3 | `api/auth/forgot-password` L46: devuelve `token, resetUrl` si NODE_ENV=development | No exponer token en response; usar solo email |
| 7 | **Sin .env.example** | 3 | 5 | No existe | Crear .env.example con variables requeridas |
| 8 | **Validación de ObjectId en params** | 3 | 4 | IDs de MongoDB (24 hex) no se validan; IDs inválidos pueden causar 500 | Validar formato antes de queries |
| 9 | **Content-Disposition filename sin sanitizar** | 3 | 2 | `archivos/[id]/download`: `nombreOriginal` directo en header | RFC 5987 encode o sanitizar caracteres |
| 10 | **SSRF potencial en download** | 3 | 2 | `fetch(archivo.ruta)` — si `ruta` se pudiera manipular | Verificar que ruta sea URL de Vercel Blob |
| 11 | **N+1 en versiones de archivo** | 3 | 3 | `api/archivos/[id]/versiones`: loop con findUnique por versión | Query recursiva o materializar cadena en una consulta |
| 12 | **Sin tests automatizados** | 4 | 5 | 0 tests | Agregar tests E2E/unitarios para flujos críticos |
| 13 | **Sin CI/CD** | 3 | 5 | No hay .github/workflows | Pipeline: lint, build, tests |
| 14 | **bodySizeLimit 500mb** | 3 | 2 | `next.config.js`: riesgo de DoS por uploads grandes | Revisar límite; validar en API además |
| 15 | **Inconsistencia auth en archivos** | 4 | 3 | Upload verifica proceso; download/delete no verifican obra | Unificar modelo de permisos |

---

## 3. QUICK WINS (< 1h) — ✅ IMPLEMENTADOS

### Tabla claim vs realidad (verificación técnica)

| Ítem del reporte | ¿Existe? | Evidencia (path + qué hace) | Acción tomada |
|------------------|----------|-----------------------------|---------------|
| 1. lib/validators.ts (isMongoObjectId, requireObjectId) en rutas :id | **Sí** | `lib/validators.ts` regex 24 hex; `requireObjectId` retorna 400. Usado en obras, archivos, procesos, admin | N/A — ya implementado |
| 2. Fix IDOR archivos (download/delete/restore/versiones) | **Sí** | `lib/permissions.ts` → `checkArchivoAccess(session, archivoId)` valida obra+rol. Usado en download, route (delete/restore), versiones | N/A — ya implementado |
| 3. safeContentDispositionFilename | **Sí** | `lib/validators.ts` → sanitiza CR/LF, comillas, limit 255. Usado en `archivos/[id]/download`, `obras/[id]/reporte`, `reportes/global` | Se añadió en reportes PDF/Excel que faltaban |
| 4. forgot-password nunca devuelve token | **Sí** | `app/api/auth/forgot-password/route.ts` — response solo `{ success, message }`; no expone token ni en dev | N/A — ya implementado |
| 5. Seed seguro (no prod, env vars) | **Sí** | `scripts/seed.ts` — `NODE_ENV===production` → exit; `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` obligatorios | N/A — ya implementado |
| 6. Paginación defensiva | **Sí** | `obras/route.ts` take:2000; bitácora/historial max take; reportes global limit; admin usuarios 500, plantillas 200, parametros 200; perfil actividad 100 | Se añadieron take/limit en obras needsSpecialPeriodQuery y admin |
| 7. Rate limit login + forgot-password | **Sí** | `lib/rate-limit.ts` — limiter en memoria (5 intentos/min). Usado en `auth.ts` authorize y `forgot-password/route.ts` | N/A — ya implementado |

### Estado consolidado

| # | Acción | Estado |
|---|--------|--------|
| 1 | Validación ObjectId en TODAS las rutas :id | ✅ `lib/validators.ts` (isMongoObjectId, requireObjectId) |
| 2 | Fix IDOR archivos (download, delete, restore, versiones) | ✅ `lib/permissions.ts` + checkArchivoAccess |
| 3 | safeContentDispositionFilename en descargas | ✅ Hecho |
| 4 | Forgot-password: nunca devolver token | ✅ Hecho |
| 5 | Seed seguro: no prod, env vars obligatorios | ✅ SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD |
| 6 | Paginación defensiva (obras, bitácora, historial, reportes) | ✅ take/limit máximos |
| 7 | Rate limit login + forgot-password | ✅ `lib/rate-limit.ts` (5 intentos/min) |

### Orden sugerido de PR (chunks)

| PR | Foco | Archivos principales |
|----|------|----------------------|
| PR1 | Validación ObjectId + manejo consistente errores 400/403/404 | `lib/validators.ts`, `lib/api-response.ts`, rutas :id |
| PR2 | Autorización anti-IDOR en archivos | `lib/permissions.ts`, `archivos/[id]/*` |
| PR3 | safeContentDispositionFilename | `lib/validators.ts`, download, reportes |
| PR4 | forgot-password sin token + seed seguro | `auth/forgot-password`, `scripts/seed.ts` |
| PR5 | Paginación defensiva | `obras`, `bitacora`, `historial`, `reportes`, admin |
| PR6 | Rate limiting | `lib/rate-limit.ts`, `auth.ts`, `forgot-password` |

### Tests mínimos (Vitest)

- `lib/validators.test.ts`: isMongoObjectId, requireObjectId (400), safeContentDispositionFilename
- `lib/rate-limit.test.ts`: verifica que el limiter bloquea tras N intentos
- Ejecutar: `npm run test`

---

## 4. MEJORAS MEDIANAS (1-2 días)

| # | Mejora | Descripción |
|---|--------|-------------|
| 1 | **Autorización en download/delete de archivos** | Verificar que el usuario tenga acceso a la obra antes de permitir download/delete |
| 2 | **Límite en reporte global** | `take: 500` o similar + advertencia si hay más |
| 3 | **Optimizar query obras 2022-2023** | Evitar doble fetch; usar una sola query con `OR` de periodo si MongoDB lo permite |
| 4 | **Rate limiting básico** | Middleware con mapa en memoria (o Vercel KV) para login y forgot-password |
| 5 | **Validación Zod en APIs** | Schemas para body/params en obras, usuarios, etc. |

---

## 5. MEJORAS GRANDES (1-2 semanas)

### Roadmap sugerido

| Semana | Foco | Tareas |
|--------|------|--------|
| 1 | Tests + CI | Jest/Vitest + Playwright; pipeline GitHub Actions |
| 2 | Seguridad | Rate limiting robusto, auditoría de permisos, headers de seguridad |
| 3 | Performance | Caché de obras, índices DB, paginación cursor |
| 4 | Observabilidad | Logging estructurado, métricas, health check |

---

## 6. CHECKLIST DE PRODUCCIÓN

### Variables de entorno
- [ ] `DATABASE_URL` — MongoDB URI seguro
- [ ] `NEXTAUTH_SECRET` — 32+ bytes aleatorios
- [ ] `NEXTAUTH_URL` — URL pública correcta
- [ ] `BLOB_READ_WRITE_TOKEN` — Token Vercel Blob (Vercel lo inyecta)
- [ ] `MAX_FILE_SIZE` — Límite razonable (ej. 50MB)
- [ ] `ALLOWED_FILE_TYPES` — Lista restrictiva
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Con restricciones de dominio en Google Cloud

### Secretos
- [ ] Ningún secreto en código
- [ ] Seed no ejecutado en prod o con credenciales de env

### Backups
- [ ] Estrategia de backup MongoDB
- [ ] Retención de Vercel Blob definida

### Rate limits
- [ ] Login: máx N intentos por IP
- [ ] Forgot-password: máx N por hora
- [ ] Upload: límite por usuario/día

### Monitoreo
- [ ] Health check `/api/health`
- [ ] Alertas de errores 5xx
- [ ] Logs en servicio externo (ej. Vercel Logs, Datadog)

### Headers de seguridad
- [ ] `X-Frame-Options`
- [ ] `X-Content-Type-Options`
- [ ] `Strict-Transport-Security` (HTTPS)

---

## 7. CATEGORÍAS DETALLADAS

### A) Bugs / Edge cases
- Obras 2022-2023: `whereSinPeriodoFiltro` sin excluir otros períodos explícitos → puede mezclar datos.
- `parseInt(ano)` sin verificar NaN en varias rutas.
- `mesParts` en reportes: entrada tipo `"1-2-3"` puede dar comportamiento inesperado.

### B) Performance
- Reporte global: carga todas las obras.
- Obras 2022-2023: doble query sin límite en una de ellas.
- Versiones de archivo: N+1.
- Sin caché en listados (React Query ayuda, pero no hay caché en servidor).

### C) Seguridad
- Download archivos sin chequeo de obra.
- Delete/Restore archivos sin permiso sobre obra.
- Forgot-password expone token en dev.
- Seed con credenciales fijas.
- Sin rate limiting.
- Role en admin usuarios: validación débil contra enum.

### D) Escalabilidad
- Reportes en memoria.
- AuditLog sin TTL ni purga.
- Posible cuello en conexiones MongoDB en serverless.

### E) Observabilidad
- Logs con `console.log` no estructurados.
- Sin request ID / tracing.
- Errores sin clasificación (no se usa Sentry ni similar).

### F) DX / Mantenibilidad
- Sin tests.
- Sin CI/CD.
- Duplicación de `canModifyProcess` en varios archivos.
- Tipado `any` en varias rutas.

### G) UX/UI
- Estados de carga genéricos.
- Errores poco descriptivos.
- Falta verificación de accesibilidad (a11y).
