# Dev Project Tracker

Un **tracker de proyectos full-stack** intuitivo y moderno construido con **Next.js 15**, **TypeScript** y **Tailwind CSS**. Diseñado específicamente para desarrolladores que necesitan gestionar múltiples proyectos de desarrollo con fases, tareas y deadlines.

## 🚀 Inicio Rápido (Modo Demo)

```bash
npm install
npm run dev
```

La aplicación funciona en **modo demo** por defecto con:
- ✅ **Proyecto de ejemplo** pre-cargado
- ✅ **Sistema de semáforos** completamente funcional  
- ✅ **Todas las características** visibles y usables
- ✅ **Cero configuración** requerida

Para habilitar persistencia de datos, configura Supabase siguiendo la [guía de configuración](#configuración-de-supabase). 

📖 **Más información**: [DEMO_MODE.md](./DEMO_MODE.md)

![Dev Project Tracker](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## Características Principales

### **Gestión Completa de Proyectos**
- **Estados**: To-Do → In-Progress → Done
- **Fases de Desarrollo**: DEV → INT → PRE → PROD
- **Progreso Automático**: Calculado en base a tareas completadas + fase actual
- **Deadlines Inteligentes**: Alertas visuales para proyectos vencidos

### **Sistema de Tareas Avanzado**
- Tareas dinámicas con checkboxes interactivos
- Progreso en tiempo real
- Estado persistente entre sesiones
- Interfaz drag-and-drop ready (extensible)

### **UI/UX Moderna**
- Diseño responsive mobile-first
- Componentes modulares reutilizables
- Animaciones suaves con Tailwind
- Badges de color para estados y fases
- Barras de progreso animadas

### **Filtrado y Búsqueda**
- Filtros por estado, fase y fecha
- Búsqueda en tiempo real
- Proyectos vencidos destacados
- Ordenamiento por prioridad automático

### **Arquitectura Escalable**
- API Routes con Next.js App Router
- Tipado fuerte con TypeScript
- Almacenamiento JSON (migrable a BD)
- Componentes modulares
- Hooks personalizados

## Configuración de Supabase

Para habilitar la persistencia de datos y el sistema de semáforos de transiciones:

1. **Crear proyecto en Supabase**: https://supabase.com/dashboard
2. **Configurar variables de entorno**:
   ```bash
   cp env.example .env.local
   # Edita .env.local con tus credenciales de Supabase
   ```
3. **Ejecutar migraciones**:
   - Ve a Supabase → SQL Editor
   - Ejecuta el script `scripts/migrate-phase-transitions.sql`

## Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ 
- **npm**, **yarn**, **pnpm** o **bun**

### 1. Clonar e Instalar
```bash
# Si partes del template de Next.js existente, ya tienes la base
npm install

# O si empiezas desde cero:
npx create-next-app@latest dev-tracker --typescript --tailwind --eslint --app
cd dev-tracker
```

### 2. Ejecutar en Desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 3. Inicializar con Datos de Ejemplo
1. Ve a la página principal
2. Haz clic en **"Crear Proyectos de Ejemplo"**
3. Explora el dashboard en `/projects`

## Estructura del Proyecto

```
dev-tracker/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── projects/            # CRUD de proyectos
│   │   │   ├── route.ts         # GET, POST
│   │   │   └── [id]/route.ts    # GET, PATCH, DELETE
│   │   └── seed/route.ts        # Datos de ejemplo
│   ├── projects/                # Páginas del tracker
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── new/page.tsx        # Crear proyecto
│   │   └── [id]/
│   │       ├── page.tsx        # Detalle del proyecto
│   │       └── edit/page.tsx   # Editar proyecto
│   ├── layout.tsx              # Layout con navegación
│   └── page.tsx                # Landing page
├── components/                  # Componentes reutilizables
│   ├── Navigation.tsx          # Barra de navegación
│   ├── ProjectCard.tsx         # Tarjeta de proyecto
│   ├── ProjectForm.tsx         # Formulario crear/editar
│   ├── ProgressBar.tsx         # Barra de progreso
│   └── StatusBadge.tsx         # Badges de estado/fase
├── lib/                        # Utilidades y lógica
│   ├── projects.ts            # Funciones de cálculo
│   ├── storage.ts             # Persistencia de datos
│   └── seed-data.ts           # Datos de ejemplo
├── types/                      # Definiciones TypeScript
│   └── project.ts             # Interfaces del proyecto
└── data/                       # Almacenamiento local
    └── projects.json          # Base de datos JSON
```

## Guía de Uso

### **Flujo Básico de Trabajo**

1. **Crear Proyecto**:
   ```
   Dashboard → "Nuevo Proyecto" → Llenar formulario → Guardar
   ```

2. **Gestionar Tareas**:
   ```
   Proyecto → Marcar tareas como completadas → Ver progreso actualizado
   ```

3. **Avanzar Fases**:
   ```
   DEV (25%) → INT (50%) → PRE (75%) → PROD (100%)
   ```

4. **Filtrar y Buscar**:
   ```
   Dashboard → Usar filtros por estado/fase → Buscar por nombre
   ```

### **Ejemplos de Proyectos Típicos**

- **E-commerce Full-Stack**: React + Node.js + PostgreSQL
- **Blog con CMS**: Next.js + MDX + Headless CMS  
- **API REST**: Express + TypeScript + MongoDB
- **App Móvil**: React Native + Expo + Backend API
- **Dashboard Analytics**: React + D3.js + WebSockets

## Personalización y Extensión

### **Migrar a Base de Datos Real**

1. **Instalar Prisma**:
```bash
npm install prisma @prisma/client
npx prisma init
```

2. **Configurar Schema**:
```prisma
// prisma/schema.prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  deadline    DateTime
  status      String
  phase       String
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id        String   @id @default(cuid())
  name      String
  completed Boolean  @default(false)
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
}
```

3. **Reemplazar** `lib/storage.ts` con calls de Prisma

### **Añadir Autenticación**

```bash
npm install next-auth
```

Integrar con NextAuth.js para proyectos multi-usuario.

### **Deploy en Vercel**

```bash
# Conectar repositorio Git
vercel --prod

# Variables de entorno para producción
# DATABASE_URL, NEXTAUTH_SECRET, etc.
```

## Casos de Uso Específicos

### **Para Freelancers**
- Trackear múltiples proyectos de clientes
- Control de deadlines y entregas
- Progreso visible para reportes

### **Para Equipos Pequeños**
- Proyectos compartidos (con auth)
- Estados de avance claros
- Fases de desarrollo estandarizadas

### **Para Estudiantes**
- Proyectos académicos organizados
- Práctica con tecnologías reales
- Portfolio de desarrollo

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
npm start

# Linting
npm run lint

# Resetear datos (eliminar data/projects.json)
rm data/projects.json

# Crear nuevos datos de ejemplo
# Ir a localhost:3000 → "Crear Proyectos de Ejemplo"
```

## Contribución y Mejoras Futuras

### **Próximas Funcionalidades**
- [ ] Autenticación con NextAuth
- [ ] Base de datos PostgreSQL/MySQL
- [ ] Colaboración en tiempo real
- [ ] Notificaciones push
- [ ] Export a PDF/CSV
- [ ] Integración con GitHub/GitLab
- [ ] Time tracking por tarea
- [ ] Dashboard de analytics

### **Tecnologías para Expandir**
- **Prisma** para ORM
- **NextAuth** para autenticación  
- **Socket.io** para tiempo real
- **Framer Motion** para animaciones
- **React Hook Form** para formularios complejos
- **Zustand** para state management global

## Licencia

Este proyecto está bajo la licencia **MIT**. Úsalo libremente para proyectos personales o comerciales.

## Soporte

¿Problemas o sugerencias? 

1. Revisa la consola del navegador para errores
2. Verifica que el puerto 3000 esté disponible  
3. Asegúrate de tener Node.js 18+
4. Elimina `data/projects.json` si hay problemas de datos

---

**¡Feliz coding!** Construido con amor para la comunidad de desarrolladores full-stack.
