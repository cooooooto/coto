# Guía de Deployment en Vercel

Esta guía cubre los pasos específicos para deployar tu aplicación Next.js + Supabase en Vercel y resolver errores comunes.

## Configuración Inicial en Vercel

### 1. Variables de Entorno

En tu proyecto de Vercel, ve a **Settings > Environment Variables** y agrega:

```bash
# Variables de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_aqui

# Configuración de entorno
NODE_ENV=production
```

⚠️ **IMPORTANTE**: 
- Marca `SUPABASE_SERVICE_ROLE_KEY` como **Sensitive** en Vercel
- Aplica las variables a **Production**, **Preview**, y **Development**

### 2. Configuración de Build

En **Settings > General**:
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x o superior
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)

## Resolución de Errores Comunes

### Error: "TypeError: fetch failed" en Vercel

**Causa**: Problemas de red o configuración en entorno serverless.

**Soluciones**:

1. **Verificar Variables de Entorno**:
   ```bash
   # En Vercel, ve a tu función y revisa los logs
   # Busca errores de configuración
   ```

2. **Timeout Issues**: 
   - Vercel Functions tienen límite de 10s en plan gratuito
   - Nuestro código ya incluye timeout de 10s
   - Para planes Pro: hasta 60s

3. **DNS/Network Issues**:
   - Vercel puede tener problemas con ciertos dominios
   - Verifica que tu URL de Supabase sea correcta
   - Prueba la conexión desde otro entorno

### Error: "Invalid API key"

**Causa**: Variables de entorno mal configuradas en Vercel.

**Solución**:
1. Ve a Vercel Dashboard > tu proyecto > Settings > Environment Variables
2. Verifica que las keys no tengan espacios extra
3. Re-deploy después de cambiar variables

### Error: "relation does not exist"

**Causa**: Las tablas no existen en tu base de datos de Supabase.

**Solución**:
1. Ve a Supabase Dashboard > SQL Editor
2. Ejecuta el schema SQL para crear las tablas
3. Verifica que las tablas estén creadas en Table Editor

### Error 500 persistente

**Diagnóstico**:
1. Ve a Vercel Dashboard > Functions > View Function Logs
2. Busca logs detallados de tu API route
3. Usa nuestro logging mejorado para identificar el problema

**Pasos de debug**:
```bash
# 1. Verifica configuración localmente
npm run verify-supabase

# 2. Si funciona local pero falla en Vercel:
# - Revisa variables de entorno en Vercel
# - Compara con tu .env.local

# 3. Deploy con logs habilitados
vercel --debug
```

## Testing en Vercel

### 1. Preview Deployments

Cada PR/push crea un preview deployment:
- Usa las mismas variables de entorno
- Perfecto para testing antes de producción
- URL: `https://tu-app-git-branch-username.vercel.app`

### 2. Verificación Post-Deploy

Después de cada deploy:

```bash
# Test API endpoint directamente
curl https://tu-app.vercel.app/api/projects

# Respuesta esperada (success):
[{"id":"...","name":"..."}]

# Respuesta de error:
{"error":"Configuration Error","type":"config"}
```

### 3. Monitoring

Vercel provee:
- **Analytics**: Rendimiento de páginas
- **Speed Insights**: Core Web Vitals
- **Function Logs**: Errores en API routes

## Optimizaciones para Serverless

### 1. Cold Start Optimization

Nuestro código ya incluye:
- Conexión persistente de Supabase
- Timeout configurado
- Error handling robusto

### 2. Edge Runtime (Opcional)

Para mejor rendimiento global:

```typescript
// En tu API route
export const runtime = 'edge';
```

⚠️ **Nota**: Edge runtime tiene limitaciones con algunas librerías.

### 3. Caching

Para reducir llamadas a Supabase:

```typescript
// Ejemplo: Cache de proyectos por 5 minutos
export const revalidate = 300;
```

## Troubleshooting Avanzado

### 1. Logs Detallados

Nuestro código incluye logging detallado:
```bash
[2024-01-01T12:00:00.000Z] Supabase getProjects: Starting to fetch projects and tasks
[2024-01-01T12:00:00.100Z] Supabase getProjects: Fetched 5 projects
```

### 2. Network Issues

Si persisten errores de red:

```typescript
// Verifica conectividad desde Vercel Function
export async function GET() {
  try {
    // Test basic connectivity
    const response = await fetch('https://httpbin.org/get');
    console.log('Network test:', response.ok);
    
    // Test Supabase URL
    const supabaseTest = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    console.log('Supabase reachable:', supabaseTest.ok);
    
  } catch (error) {
    console.error('Network test failed:', error);
  }
}
```

### 3. Environment Debugging

```typescript
// Temporary debug endpoint (REMOVE after fixing)
export async function GET() {
  return Response.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV
  });
}
```

## Checklist de Deployment

Antes de cada deploy a producción:

- [ ] Variables de entorno configuradas en Vercel
- [ ] `npm run verify-supabase` pasa localmente
- [ ] Schema SQL ejecutado en Supabase
- [ ] Preview deployment funciona correctamente
- [ ] API endpoints responden correctamente
- [ ] Error handling testado (URLs incorrectas, etc.)

## Contacto y Soporte

Si persisten los errores:

1. **Vercel Support**: Para issues específicos de la plataforma
2. **Supabase Support**: Para problemas de conectividad DB
3. **GitHub Issues**: Para bugs en el código de la aplicación

**Logs importantes a incluir**:
- Function logs de Vercel
- Browser console errors
- Network tab en DevTools
- Output de `npm run verify-supabase`
