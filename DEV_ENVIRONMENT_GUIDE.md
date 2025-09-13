# Guía de Entorno de Desarrollo

## 📋 Resumen

Este proyecto ahora soporta múltiples entornos de base de datos:
- **Producción**: Datos reales, usuarios reales
- **Desarrollo**: Datos de prueba, desarrollo seguro

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```bash
# Environment Configuration
NODE_ENV=development

# Production Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-prod
SUPABASE_SERVICE_ROLE_KEY=tu-clave-servicio-prod

# Development Supabase Configuration
NEXT_PUBLIC_SUPABASE_DEV_URL=https://tu-proyecto-dev.supabase.co
NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY=tu-clave-anonima-dev
SUPABASE_DEV_SERVICE_ROLE_KEY=tu-clave-servicio-dev

# Jira Integration (Optional)
JIRA_HOST=tu-dominio.atlassian.net
JIRA_EMAIL=tu-email@example.com
JIRA_API_TOKEN=tu-token-jira
```

### 2. Configurar Base de Datos de Desarrollo

```bash
# Verificar configuración
npm run verify-environments

# Configurar base de datos de desarrollo
npm run setup-dev

# O paso a paso:
npm run migrate-to-dev    # Aplicar esquema
npm run seed-dev         # Poblar con datos de prueba
```

## 🛠️ Comandos Disponibles

### Desarrollo
```bash
npm run dev              # Modo desarrollo (usa DB dev)
npm run dev:prod         # Modo desarrollo con DB producción
npm run build:dev        # Build para desarrollo
```

### Gestión de Base de Datos
```bash
npm run verify-environments  # Verificar ambos entornos
npm run migrate-to-dev       # Migrar esquema a desarrollo
npm run seed-dev            # Poblar datos de prueba
npm run reset-dev           # Limpiar y repoblar desarrollo
npm run setup-dev           # Configuración completa de desarrollo
```

### Verificación
```bash
npm run test-envs           # Probar todos los entornos
npm run verify-supabase     # Verificación básica (compatibilidad)
```

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo Diario
1. **Usar entorno de desarrollo:**
   ```bash
   npm run dev  # Automáticamente usa la DB de desarrollo
   ```

2. **Probar cambios:**
   - Todos los cambios se hacen contra datos de prueba
   - Sin riesgo de afectar datos reales
   - Resetear datos cuando sea necesario: `npm run reset-dev`

### Para Testing de Producción
1. **Probar con datos reales (cuidadosamente):**
   ```bash
   npm run dev:prod  # Usa DB de producción en modo desarrollo
   ```

2. **Solo para verificación, NO para desarrollo activo**

### Para Deployment
```bash
npm run build            # Build para producción (usa variables de prod)
npm start               # Ejecutar en producción
```

## 🔒 Seguridad

### Variables de Entorno
- ✅ **DO**: Mantener `.env.local` en `.gitignore`
- ✅ **DO**: Usar diferentes claves para dev y prod
- ❌ **DON'T**: Commitear credenciales reales
- ❌ **DON'T**: Usar claves de producción en desarrollo

### Datos Sensibles
- ✅ **DO**: Desarrollo usa datos anonimizados/ficticios
- ✅ **DO**: Limpiar datos sensibles al migrar de prod a dev
- ❌ **DON'T**: Copiar datos reales de usuarios a desarrollo
- ❌ **DON'T**: Usar tokens/APIs reales en desarrollo

### Row Level Security (RLS)
- ✅ Las políticas RLS están habilitadas en ambos entornos
- ✅ Mismo nivel de seguridad en desarrollo y producción
- ✅ Testing de permisos con usuarios de prueba

## 📊 Datos de Prueba

### Usuarios Predefinidos
```typescript
// Usuarios de prueba disponibles en desarrollo
const testUsers = [
  { email: 'admin@test.dev', role: 'admin' },
  { email: 'developer@test.dev', role: 'member' },
  { email: 'viewer@test.dev', role: 'viewer' }
];
```

### Proyectos de Ejemplo
- Sistema de Autenticación (En progreso, DEV)
- API de Productos (Por hacer, DEV)  
- Dashboard Analytics (Completado, PROD)
- Integración con Jira (En progreso, INT)

## 🚨 Solución de Problemas

### Error: "relation does not exist"
```bash
# Aplicar esquema a desarrollo
npm run migrate-to-dev
```

### Error: "Invalid API key"
```bash
# Verificar configuración
npm run verify-environments
# Revisar claves en .env.local
```

### Error: "fetch failed"
```bash
# Verificar URLs de Supabase
npm run test-envs --env=development
```

### Datos inconsistentes
```bash
# Resetear completamente el entorno de desarrollo
npm run reset-dev
```

## 🔄 Mantenimiento Regular

### Semanal
- Ejecutar `npm run verify-environments` para verificar salud
- Actualizar datos de prueba si es necesario: `npm run reset-dev`

### Mensual  
- Revisar y limpiar datos de desarrollo
- Sincronizar cambios de esquema: `npm run migrate-to-dev`

### Antes de Releases
- Probar con `npm run dev:prod` para verificar compatibilidad
- Ejecutar todas las verificaciones: `npm run test-envs`

## 📈 Monitoreo

### Métricas a Observar
- Tiempo de respuesta en desarrollo vs producción
- Uso de conexiones de base de datos
- Errores de RLS o permisos

### Logs Importantes
```typescript
// Los logs incluyen información del entorno:
console.log('🔗 Cliente Supabase creado para entorno: development');
console.log('🔑 Cliente admin Supabase creado para entorno: development');
```

## 🤝 Colaboración en Equipo

### Compartir Configuración
- Actualizar `env.example` con nuevas variables
- Documentar cambios de esquema en commits
- Usar `npm run setup-dev` para nuevos desarrolladores

### Mejores Prácticas
- Siempre desarrollar en entorno de desarrollo
- Probar migraciones en desarrollo antes de aplicar a producción
- Comunicar cambios que afecten el esquema de base de datos

## 🔮 Próximos Pasos

### Mejoras Sugeridas
1. **CI/CD Integration**: Automatizar deployment de cambios de esquema
2. **Testing Automatizado**: Tests que usen el entorno de desarrollo
3. **Backup Automático**: Respaldos regulares del entorno de desarrollo
4. **Métricas**: Dashboard para monitorear ambos entornos
