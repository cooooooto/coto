# Configuración de Supabase

Esta guía te ayudará a configurar Supabase para el Dev Project Tracker.

## Paso 1: Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Elige tu organización y configura:
   - **Name**: `dev-project-tracker` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura
   - **Region**: Elige la región más cercana a ti
4. Haz clic en "Create new project"

## Paso 2: Configurar las tablas de base de datos

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `supabase/schema.sql`
3. Ejecuta el script haciendo clic en "Run"

Esto creará:
- Tabla `projects` con todos los campos necesarios
- Tabla `tasks` relacionada con proyectos
- Índices para optimizar consultas
- Políticas RLS para seguridad
- Triggers para actualizar timestamps automáticamente

## Paso 3: Obtener las credenciales

1. Ve a **Settings > API** en tu proyecto de Supabase
2. Encontrarás:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (¡Mantén esto secreto!)

## Paso 4: Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_aqui
```

2. Reemplaza los valores con tus credenciales reales de Supabase

## Paso 5: Verificar la conexión

1. Reinicia tu servidor de desarrollo:
```bash
npm run dev
```

2. Ve a `http://localhost:3000` y verifica que:
   - La página carga sin errores
   - Puedes crear un nuevo proyecto
   - Los proyectos se guardan correctamente
   - Puedes editar y eliminar proyectos

## Migrar datos existentes (opcional)

Si ya tienes proyectos en el sistema JSON, puedes migrarlos:

1. Ve a **Table Editor > projects** en Supabase
2. Usa "Insert row" para agregar manualmente algunos proyectos de prueba
3. O crea un script de migración personalizado

## Configuración de producción

Para Vercel:

1. Ve a tu proyecto en Vercel
2. Configuración > Environment Variables
3. Agrega las tres variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que no haya espacios extra en las claves

### Error: "relation does not exist"
- Ejecuta el script SQL en el SQL Editor de Supabase
- Verifica que las tablas se crearon correctamente

### Error de conexión
- Revisa que la URL del proyecto sea correcta
- Verifica que el proyecto de Supabase esté activo

### RLS (Row Level Security)
- Las políticas están configuradas para acceso público por simplicidad
- Para producción, considera implementar autenticación y políticas más restrictivas

## Próximos pasos

Una vez configurado Supabase:

1. ✅ Los proyectos se guardan en PostgreSQL
2. ✅ Mejor rendimiento y escalabilidad
3. ✅ Backups automáticos
4. 🔄 Considera agregar autenticación de usuarios
5. 🔄 Implementar roles y permisos más granulares
6. 🔄 Agregar funcionalidades en tiempo real (subscriptions)

¡Listo! Ahora tienes una base de datos real para tu Dev Project Tracker.
