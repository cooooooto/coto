# 🎯 Modo Demo - Dev Project Tracker

## ¿Qué es el Modo Demo?

El **Modo Demo** permite usar la aplicación completa sin necesidad de configurar Supabase. Es perfecto para:

- ✅ Probar la funcionalidad sin configuración
- ✅ Demostrar el sistema de semáforos  
- ✅ Evaluar la interfaz y características
- ✅ Desarrollo y testing local

## 🚀 Cómo Funciona

### Automático
La aplicación detecta automáticamente si está en modo demo cuando:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://placeholder.supabase.co`
- Las credenciales son valores placeholder

### Datos Mock
En modo demo, la aplicación usa:
- **Proyecto de ejemplo**: "Proyecto Demo - E-commerce"
- **Usuario mock**: Usuario Demo (admin)
- **Tareas de ejemplo**: 5 tareas con diferentes estados
- **Transiciones simuladas**: Sistema de semáforos completamente funcional

## 📋 Características Disponibles

### ✅ Funciona Completamente
- Navegación entre páginas
- Visualización de proyectos
- Sistema de semáforos de transiciones
- Interfaz de usuario completa
- Componentes interactivos
- Estados visuales (badges, colores, animaciones)

### ⚠️ Limitaciones del Modo Demo
- Los cambios NO se persisten (se pierden al recargar)
- Solo hay 1 proyecto de ejemplo
- No se pueden crear nuevos proyectos permanentes
- Las transiciones de fase se simulan

## 🔧 Cambiar a Modo Producción

Para habilitar persistencia de datos y funcionalidad completa:

1. **Crear proyecto Supabase**: https://supabase.com/dashboard
2. **Configurar variables de entorno**:
   ```bash
   # Edita .env.local con tus credenciales reales
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-key
   ```
3. **Ejecutar migración**: 
   - Supabase → SQL Editor
   - Ejecutar `scripts/migrate-phase-transitions.sql`

## 🎉 Ventajas del Modo Demo

- **Cero configuración**: Funciona inmediatamente
- **Sin errores**: No hay conexiones fallidas
- **Experiencia completa**: Todas las características visibles
- **Ideal para demos**: Perfecto para mostrar el sistema

## 🔍 Identificar el Modo Actual

### En la Consola
```
⚠️ Supabase not configured. Create .env.local with your credentials to enable full functionality.
[API] Running in demo mode - returning mock data
```

### En la Aplicación
- Solo aparece 1 proyecto ("Proyecto Demo - E-commerce")
- Los cambios no se guardan al recargar la página
- El usuario siempre es "Usuario Demo"

## 🚦 Sistema de Semáforos en Demo

El sistema de control de transiciones funciona completamente en modo demo:

- **Solicitar transiciones**: DEV → INT → PRE → PROD
- **Aprobar/Rechazar**: Con comentarios y roles
- **Indicadores visuales**: Semáforo verde/amarillo/rojo
- **Historial**: Se simula el historial de transiciones

¡Perfecto para demostrar el flujo completo de trabajo DevOps!

---

**💡 Consejo**: Usa el modo demo para evaluar si el sistema cumple tus necesidades antes de configurar Supabase.
