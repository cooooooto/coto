# Guía de Migración: Supabase → Neon

Esta guía te llevará paso a paso a través de la migración completa de tu proyecto Next.js desde Supabase hacia Neon Database, manteniendo toda la funcionalidad existente.

## 🎯 Objetivos de la Migración

- **Migrar esquema PostgreSQL** de Supabase a Neon
- **Actualizar código Next.js** para usar Neon como base de datos
- **Mantener compatibilidad** con la funcionalidad existente
- **Mejorar rendimiento** con serverless scaling
- **Reducir costos** para proyectos pequeños/medianos

## 📋 Prerrequisitos

### Software Requerido
- **Node.js** 18+ y npm
- **PostgreSQL client tools** (pg_dump, psql)
- **Git** para control de versiones

### Cuentas y Accesos
- **Cuenta Neon** activa ([neon.tech](https://neon.tech))
- **Acceso a Supabase** existente (para backup)
- **Variables de entorno** de Supabase configuradas

### Verificar Instalación
```bash
node --version     # v18+
npm --version      # 8+
pg_dump --version  # PostgreSQL client
```

## 🚀 Migración Automática (Recomendado)

### Paso 1: Ejecutar Script de Migración
```bash
npm run migrate-to-neon
```

Este script automatiza todo el proceso:
- ✅ Backup de Supabase
- ✅ Configuración de Neon
- ✅ Migración de esquema
- ✅ Actualización de código
- ✅ Instalación de dependencias

### Paso 2: Configurar Neon
Cuando se solicite, proporciona tu **connection string** de Neon:

```
postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require
```

### Paso 3: Verificar Migración
El script verificará automáticamente:
- Conexión a Neon
- Migración de esquema
- Funcionalidad de consultas

## 🔧 Migración Manual (Paso a Paso)

### Paso 1: Backup de Supabase
```bash
# Crear backup del esquema
npm run backup-supabase

# O manualmente:
PGPASSWORD=tu_password pg_dump \
  --host=db.tu-proyecto.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=backup-schema.sql
```

### Paso 2: Configurar Neon
1. **Crear proyecto en Neon**
   - Ve a [neon.tech](https://neon.tech)
   - Crea nuevo proyecto
   - Copia connection string

2. **Configurar variables de entorno**
```bash
# .env.local
NEON_DATABASE_URL=postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require
DATABASE_URL=postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require

# NextAuth (si usas autenticación)
NEXTAUTH_SECRET=tu_secret_aleatorio_de_32_caracteres
NEXTAUTH_URL=http://localhost:3000
```

### Paso 3: Importar Esquema
```bash
# Usando el script
npm run setup-neon

# O manualmente:
psql "postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require" \
  -f backup-schema.sql
```

### Paso 4: Instalar Dependencias
```bash
npm install
```

### Paso 5: Verificar Funcionamiento
```bash
npm run dev
```

## 🔄 Cambios Realizados en el Código

### Servicios de Base de Datos
- **Antes**: `SupabaseService` con cliente Supabase
- **Después**: `DatabaseService` agnóstico que detecta automáticamente el proveedor

### API Routes Actualizadas
```typescript
// Antes
import { SupabaseService } from '@/lib/supabase-service';

// Después  
import { DatabaseService as SupabaseService } from '@/lib/database-service';
```

### Configuración de Conexión
- **Supabase**: SDK con URL + API keys
- **Neon**: Connection string PostgreSQL + driver serverless

## 🔐 Autenticación

### Opción 1: NextAuth.js (Recomendado)
```typescript
// lib/auth-config.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Configuración de credenciales
    })
  ],
  // Más configuración...
};
```

### Opción 2: Mantener Supabase Auth (Híbrido)
- Usar Supabase solo para autenticación
- Neon para datos de aplicación
- Requiere mantener ambas conexiones

## 📊 Comparación: Supabase vs Neon

| Característica | Supabase | Neon |
|---|---|---|
| **Tipo** | BaaS completo | Database-as-a-Service |
| **Autenticación** | ✅ Incluida | ❌ Requiere implementación |
| **Real-time** | ✅ WebSockets | ❌ Requiere solución externa |
| **Serverless** | ✅ Parcial | ✅ Completo |
| **Branching** | ❌ No disponible | ✅ Git-like branching |
| **Pricing** | $$ Medio | $ Económico |
| **Escalabilidad** | ✅ Buena | ✅ Excelente |

## 🎯 Beneficios de Neon

### Para Desarrollo
- **Branching de BD**: Crea ramas de base de datos como Git
- **Reset fácil**: Restaura datos de desarrollo rápidamente
- **Environments**: Dev, staging, prod separados

### Para Producción
- **Auto-scaling**: Escala automáticamente con la demanda
- **Cold starts**: Despierta instantáneamente desde suspensión
- **Backup automático**: Point-in-time recovery

### Para Costos
- **Pay-per-use**: Solo pagas por lo que usas
- **Suspensión automática**: Se suspende cuando no hay actividad
- **Free tier generoso**: 0.5GB storage, 1M queries/mes

## 🔍 Verificación Post-Migración

### Checklist de Funcionalidad
- [ ] ✅ Aplicación inicia sin errores
- [ ] ✅ Proyectos se cargan correctamente
- [ ] ✅ CRUD de proyectos funciona
- [ ] ✅ Tareas se muestran y actualizan
- [ ] ✅ Filtros y búsquedas funcionan
- [ ] ✅ API endpoints responden correctamente

### Pruebas de Rendimiento
```bash
# Probar conexión
npm run verify-environments

# Probar queries
curl http://localhost:3000/api/projects

# Verificar logs
# Revisar consola del navegador y terminal
```

## 🚨 Solución de Problemas

### Error: "Connection failed"
```bash
# Verificar connection string
echo $DATABASE_URL

# Probar conexión directa
psql "$DATABASE_URL" -c "SELECT version();"
```

### Error: "Table does not exist"
```bash
# Re-importar esquema
npm run setup-neon

# O manualmente:
psql "$DATABASE_URL" -f supabase/schema.sql
```

### Error: "NextAuth configuration"
```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Agregar a .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

## 🔄 Rollback (Revertir Migración)

Si necesitas revertir la migración:

### Paso 1: Restaurar Variables de Entorno
```bash
# Comentar variables de Neon en .env.local
# NEON_DATABASE_URL=...
# DATABASE_URL=...

# Descomentar variables de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio
```

### Paso 2: Revertir Imports
```bash
# Buscar y reemplazar en el código
grep -r "DatabaseService" app/api/
# Cambiar de vuelta a SupabaseService
```

### Paso 3: Reinstalar Dependencias
```bash
npm install
```

## 📈 Optimizaciones Post-Migración

### Connection Pooling
```typescript
// lib/neon-config.ts
export const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // máximo de conexiones
  idleTimeoutMillis: 30000,
});
```

### Caching de Queries
```typescript
// Implementar cache con Redis o memoria
const cache = new Map();

export async function getCachedProjects() {
  if (cache.has('projects')) {
    return cache.get('projects');
  }
  
  const projects = await DatabaseService.getProjects();
  cache.set('projects', projects);
  return projects;
}
```

### Monitoring
```typescript
// Agregar métricas de rendimiento
console.time('database-query');
const result = await DatabaseService.getProjects();
console.timeEnd('database-query');
```

## 🚀 Deploy a Producción

### Vercel
```bash
# Configurar variables de entorno en Vercel
vercel env add NEON_DATABASE_URL
vercel env add DATABASE_URL  
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy
vercel --prod
```

### Variables de Entorno de Producción
```bash
# Production
DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=tu_secret_de_produccion_diferente
NEXTAUTH_URL=https://tu-dominio.vercel.app

# Optional: OAuth providers
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

## 📚 Recursos Adicionales

### Documentación
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

### Herramientas
- [Neon Console](https://console.neon.tech)
- [Database Schema Visualizer](https://dbdiagram.io)
- [SQL Query Builder](https://sqlbolt.com)

### Comunidad
- [Neon Discord](https://discord.gg/neon)
- [Next.js Discord](https://discord.gg/nextjs)
- [PostgreSQL Community](https://www.postgresql.org/community/)

---

## 🎉 ¡Felicitaciones!

Has migrado exitosamente de Supabase a Neon. Tu aplicación ahora cuenta con:

- ✅ **Database serverless** con auto-scaling
- ✅ **Branching de BD** para desarrollo
- ✅ **Mejor rendimiento** en cold starts
- ✅ **Costos optimizados** pay-per-use
- ✅ **Arquitectura moderna** y escalable

¡Disfruta de los beneficios de Neon en tu proyecto Next.js! 🚀
