// Datos de ejemplo para testing del Dev Project Tracker

import { Project } from '@/types/project';
import { generateId, calculateProjectProgress } from './projects';

// ID de usuario por defecto para proyectos de ejemplo
const DEFAULT_OWNER_ID = 'sample-user-id';

export const sampleProjects: Omit<Project, 'progress'>[] = [
  {
    id: generateId(),
    name: 'E-commerce Full-Stack App',
    description: 'Plataforma de e-commerce con React/Next.js, Node.js, PostgreSQL y Stripe para pagos.',
    owner_id: DEFAULT_OWNER_ID,
    tasks: [
      {
        id: generateId(),
        name: 'Setup inicial del proyecto y estructura de carpetas',
        completed: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: generateId(),
        name: 'Diseño de base de datos y modelos',
        completed: true,
        createdAt: new Date('2024-01-16')
      },
      {
        id: generateId(),
        name: 'API REST para productos y categorías',
        completed: true,
        createdAt: new Date('2024-01-17')
      },
      {
        id: generateId(),
        name: 'Frontend - Lista y detalle de productos',
        completed: false,
        createdAt: new Date('2024-01-18')
      },
      {
        id: generateId(),
        name: 'Sistema de autenticación (JWT)',
        completed: false,
        createdAt: new Date('2024-01-19')
      },
      {
        id: generateId(),
        name: 'Carrito de compras y checkout',
        completed: false,
        createdAt: new Date('2024-01-20')
      },
      {
        id: generateId(),
        name: 'Integración con Stripe',
        completed: false,
        createdAt: new Date('2024-01-21')
      },
      {
        id: generateId(),
        name: 'Panel de administración',
        completed: false,
        createdAt: new Date('2024-01-22')
      }
    ],
    deadline: new Date('2024-03-15'),
    status: 'In-Progress',
    phase: 'DEV',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: generateId(),
    name: 'Blog Personal con CMS',
    description: 'Blog personal con Next.js, MDX para contenido y dashboard para gestión de posts.',
    owner_id: DEFAULT_OWNER_ID,
    tasks: [
      {
        id: generateId(),
        name: 'Setup de Next.js con TypeScript',
        completed: true,
        createdAt: new Date('2024-01-10')
      },
      {
        id: generateId(),
        name: 'Configuración de MDX y highlighting',
        completed: true,
        createdAt: new Date('2024-01-11')
      },
      {
        id: generateId(),
        name: 'Diseño responsive del blog',
        completed: true,
        createdAt: new Date('2024-01-12')
      },
      {
        id: generateId(),
        name: 'Sistema de comentarios',
        completed: true,
        createdAt: new Date('2024-01-13')
      },
      {
        id: generateId(),
        name: 'SEO y meta tags dinámicos',
        completed: false,
        createdAt: new Date('2024-01-14')
      },
      {
        id: generateId(),
        name: 'Dashboard para crear/editar posts',
        completed: false,
        createdAt: new Date('2024-01-15')
      }
    ],
    deadline: new Date('2024-02-28'),
    status: 'In-Progress',
    phase: 'INT',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: generateId(),
    name: 'API REST para SaaS',
    description: 'API robusta para aplicación SaaS con autenticación, subscripciones y analytics.',
    owner_id: DEFAULT_OWNER_ID,
    tasks: [
      {
        id: generateId(),
        name: 'Arquitectura y setup inicial',
        completed: true,
        createdAt: new Date('2024-01-05')
      },
      {
        id: generateId(),
        name: 'Autenticación con JWT y refresh tokens',
        completed: true,
        createdAt: new Date('2024-01-06')
      },
      {
        id: generateId(),
        name: 'Sistema de roles y permisos',
        completed: true,
        createdAt: new Date('2024-01-07')
      },
      {
        id: generateId(),
        name: 'Endpoints CRUD principales',
        completed: true,
        createdAt: new Date('2024-01-08')
      },
      {
        id: generateId(),
        name: 'Integración con Stripe para subscripciones',
        completed: true,
        createdAt: new Date('2024-01-09')
      },
      {
        id: generateId(),
        name: 'Sistema de analytics y métricas',
        completed: true,
        createdAt: new Date('2024-01-10')
      },
      {
        id: generateId(),
        name: 'Rate limiting y seguridad',
        completed: true,
        createdAt: new Date('2024-01-11')
      },
      {
        id: generateId(),
        name: 'Documentación con Swagger',
        completed: true,
        createdAt: new Date('2024-01-12')
      }
    ],
    deadline: new Date('2024-01-31'),
    status: 'Done',
    phase: 'PROD',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: generateId(),
    name: 'Dashboard Analytics',
    description: 'Dashboard interactivo para visualización de datos con React, D3.js y WebSockets.',
    owner_id: DEFAULT_OWNER_ID,
    tasks: [
      {
        id: generateId(),
        name: 'Setup del proyecto con Vite',
        completed: true,
        createdAt: new Date('2024-02-01')
      },
      {
        id: generateId(),
        name: 'Componentes base y routing',
        completed: true,
        createdAt: new Date('2024-02-02')
      },
      {
        id: generateId(),
        name: 'Integración con D3.js para gráficos',
        completed: false,
        createdAt: new Date('2024-02-03')
      },
      {
        id: generateId(),
        name: 'WebSockets para datos en tiempo real',
        completed: false,
        createdAt: new Date('2024-02-04')
      },
      {
        id: generateId(),
        name: 'Filtros y exportación de datos',
        completed: false,
        createdAt: new Date('2024-02-05')
      }
    ],
    deadline: new Date('2024-04-01'),
    status: 'To-Do',
    phase: 'DEV',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-02')
  },
  {
    id: generateId(),
    name: 'App Móvil React Native',
    description: 'Aplicación móvil multiplataforma para gestión de tareas con sincronización offline.',
    owner_id: DEFAULT_OWNER_ID,
    tasks: [
      {
        id: generateId(),
        name: 'Setup de React Native y navegación',
        completed: true,
        createdAt: new Date('2023-12-01')
      },
      {
        id: generateId(),
        name: 'Diseño UI/UX y componentes',
        completed: true,
        createdAt: new Date('2023-12-05')
      },
      {
        id: generateId(),
        name: 'CRUD local con SQLite',
        completed: true,
        createdAt: new Date('2023-12-10')
      },
      {
        id: generateId(),
        name: 'Sincronización con API backend',
        completed: true,
        createdAt: new Date('2023-12-15')
      },
      {
        id: generateId(),
        name: 'Funcionalidad offline con Redux Persist',
        completed: true,
        createdAt: new Date('2023-12-20')
      },
      {
        id: generateId(),
        name: 'Push notifications',
        completed: false,
        createdAt: new Date('2023-12-25')
      },
      {
        id: generateId(),
        name: 'Testing y optimización',
        completed: false,
        createdAt: new Date('2023-12-30')
      }
    ],
    deadline: new Date('2023-12-31'), // Proyecto vencido para testing
    status: 'In-Progress',
    phase: 'PRE',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-10')
  }
];

// Función para inicializar datos de ejemplo
export async function seedSampleData() {
  try {
    // Calcular progreso para cada proyecto
    const projectsWithProgress = sampleProjects.map(project => ({
      ...project,
      progress: calculateProjectProgress(project as Project)
    }));

    // Guardar en el archivo JSON
    const fs = await import('fs');
    const path = await import('path');
    
    const projectsFile = path.join(process.cwd(), 'data', 'projects.json');
    
    // Crear directorio si no existe
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(projectsFile, JSON.stringify(projectsWithProgress, null, 2));
    
    console.log('Datos de ejemplo creados exitosamente');
    return projectsWithProgress;
  } catch (error) {
    console.error('Error creando datos de ejemplo:', error);
    throw error;
  }
}
