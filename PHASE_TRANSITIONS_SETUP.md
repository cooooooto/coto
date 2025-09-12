# Sistema de Semáforos de Control - Guía de Implementación

## 🚦 Sistema de Semáforos de Control para Transiciones de Fase

Has implementado exitosamente un sistema de control de transiciones de fase que actúa como "semáforo" para asegurar transiciones seguras entre las fases DEV → INT → PRE → PROD.

## 📋 Componentes Implementados

### 1. **Base de Datos**
- ✅ Nueva tabla `phase_transitions` para gestionar solicitudes y aprobaciones
- ✅ Campos agregados a `projects`: `requires_approval`, `current_transition_id`
- ✅ Políticas de seguridad (RLS) configuradas
- ✅ Índices optimizados para rendimiento

### 2. **Backend (API)**
- ✅ Servicios de Supabase actualizados con métodos de transición
- ✅ API endpoints:
  - `POST /api/projects/[id]/transitions` - Solicitar transición
  - `PATCH /api/transitions/[id]` - Revisar transición
  - `GET /api/transitions/pending` - Obtener transiciones pendientes

### 3. **Frontend (Componentes)**
- ✅ `PhaseTransitionSemaphore` - Componente principal del semáforo
- ✅ Hook `useCurrentUser` - Gestión de usuario actual
- ✅ Integración en página de detalle del proyecto

### 4. **Tipos TypeScript**
- ✅ Interfaces `PhaseTransition`, `TransitionStatus`
- ✅ Actualización de tipos de base de datos
- ✅ Colores y estilos para estados de transición

## 🚀 Pasos de Configuración

### Paso 1: Aplicar Migración de Base de Datos

**IMPORTANTE**: Debes ejecutar el script de migración en tu base de datos Supabase.

1. Ve a tu panel de Supabase → SQL Editor
2. Copia y pega el contenido de `scripts/migrate-phase-transitions.sql`
3. Ejecuta el script

### Paso 2: Verificar la Configuración

```bash
# Instalar dependencias (si es necesario)
npm install

# Verificar que no hay errores de TypeScript
npm run build
```

### Paso 3: Configurar Usuario de Prueba

El sistema incluye un usuario mock para pruebas. En producción, integra con Supabase Auth:

```typescript
// En hooks/useCurrentUser.ts - reemplaza el mock con:
const { data: { user } } = await supabase.auth.getUser();
```

## 🎯 Cómo Funciona

### Flujo de Trabajo

1. **Solicitud de Transición**
   - Usuario con permisos solicita avance de fase
   - Sistema crea registro en `phase_transitions` con status `pending`
   - Proyecto muestra semáforo amarillo (pendiente)

2. **Aprobación/Rechazo**
   - Administrador o owner del proyecto revisa la solicitud
   - Puede aprobar ✅ o rechazar ❌ con comentarios
   - Si se aprueba: proyecto avanza de fase automáticamente
   - Si se rechaza: solicitud se marca como rechazada

3. **Estados Visuales**
   - 🟢 Verde: Sin transiciones pendientes, fase activa
   - 🟡 Amarillo (pulsante): Transición pendiente de aprobación
   - 🔴 Rojo: Transición rechazada

### Permisos

| Acción | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Solicitar transición | ✅ | ✅ | ✅ | ❌ |
| Aprobar transición | ✅ | ✅ | ❌ | ❌ |
| Ver historial | ✅ | ✅ | ✅ | ✅ |

## 🎨 Características del Semáforo

### Indicadores Visuales
- **Semáforo circular**: Verde/Amarillo/Rojo según estado
- **Animación de pulso**: Para transiciones pendientes
- **Badges informativos**: Estados con colores distintivos
- **Progreso de fases**: DEV → INT → PRE → PROD

### Funcionalidades
- **Comentarios**: Justificación en solicitudes y revisiones
- **Historial completo**: Todas las transiciones registradas
- **Notificaciones visuales**: Estados claros para el equipo
- **Prevención de conflictos**: Solo una transición pendiente por proyecto

## 📊 Ejemplo de Uso

### Caso: Proyecto E-commerce

```
🟡 DEV (Pendiente aprobación) → 🔄 INT → ⚪ PRE → ⚪ PROD
   └─ Solicitud por: @developer
   └─ Comentario: "Tests unitarios al 95%, docs actualizadas"
   └─ Esperando: @tech-lead
```

**Criterios de Aprobación por Fase:**

| DEV → INT | INT → PRE | PRE → PROD |
|-----------|-----------|------------|
| Code review completado | QA validation | UAT completado |
| Tests unitarios > 90% | Performance tests OK | Rollback plan listo |
| Documentación actualizada | Security scan limpio | Stakeholder approval |

## 🔧 Personalización

### Deshabilitar Aprobaciones
Para proyectos que no requieren aprobación manual:

```sql
UPDATE projects SET requires_approval = FALSE WHERE id = 'project-id';
```

### Configurar Roles Personalizados
Modifica las políticas de RLS en Supabase para ajustar permisos según tus necesidades.

### Integrar Notificaciones
Extiende el sistema para enviar notificaciones por email/Slack cuando hay transiciones pendientes:

```typescript
// Ejemplo de integración
await notifyTeam({
  type: 'transition_requested',
  project: project.name,
  from: transition.from_phase,
  to: transition.to_phase,
  requester: user.full_name
});
```

## 🐛 Solución de Problemas

### Error: "Transición no encontrada"
- Verifica que la migración de base de datos se aplicó correctamente
- Confirma que el usuario tiene permisos en el proyecto

### Error: "Ya existe una transición pendiente"
- Solo puede haber una transición pendiente por proyecto
- Resuelve o cancela la transición existente primero

### Semáforo no aparece
- Verifica que `currentUser` no es null
- Confirma que el proyecto tiene `requires_approval = true`

## 📈 Métricas Sugeridas

Considera implementar un dashboard con:
- Tiempo promedio de aprobación por fase
- Tasa de rechazo por fase
- Proyectos con transiciones pendientes
- Cuellos de botella en el pipeline

## 🎉 ¡Listo!

Tu sistema de semáforos de control está implementado y listo para usar. Este sistema asegura:

- ✅ **Transiciones controladas** entre fases
- ✅ **Colaboración humana** en decisiones críticas  
- ✅ **Visibilidad completa** del estado del pipeline
- ✅ **Historial auditado** de todas las transiciones
- ✅ **Prevención de errores** en despliegues

¡Ahora tienes un pipeline DevOps robusto con controles manuales que mantiene la calidad y reduce riesgos en tus proyectos! 🚀
