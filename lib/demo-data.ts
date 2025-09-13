// Demo data for offline mode
import { Project } from '@/types/project';

export const demoProjects: Project[] = [
  {
    id: 'demo-project-1',
    name: 'Proyecto Demo - E-commerce',
    description: 'Proyecto de demostración del sistema de semáforos de control de transiciones entre fases de desarrollo. Incluye todas las características principales del tracker.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'In-Progress',
    phase: 'DEV',
    progress: 45,
    requires_approval: true,
    owner_id: 'mock-user-id-123',
    tasks: [
      { 
        id: 'task-1', 
        name: 'Configurar base de datos PostgreSQL', 
        completed: true, 
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      { 
        id: 'task-2', 
        name: 'Implementar autenticación con JWT', 
        completed: true, 
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-3', 
        name: 'Crear API REST para productos', 
        completed: false, 
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-4', 
        name: 'Diseñar interfaz de usuario responsive', 
        completed: false, 
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-5', 
        name: 'Escribir tests unitarios y de integración', 
        completed: false, 
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-6', 
        name: 'Configurar pipeline CI/CD', 
        completed: false, 
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 'demo-project-2',
    name: 'API Microservicios - Blog',
    description: 'Sistema de microservicios para plataforma de blogging con arquitectura escalable.',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    status: 'To-Do',
    phase: 'DEV',
    progress: 15,
    requires_approval: true,
    owner_id: 'mock-user-id-123',
    tasks: [
      { 
        id: 'task-7', 
        name: 'Diseñar arquitectura de microservicios', 
        completed: true, 
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-8', 
        name: 'Configurar Docker y Kubernetes', 
        completed: false, 
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-9', 
        name: 'Implementar servicio de usuarios', 
        completed: false, 
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      { 
        id: 'task-10', 
        name: 'Implementar servicio de contenido', 
        completed: false, 
        createdAt: new Date()
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  }
];

export const isDemoMode = (): boolean => {
  // Verificar si hay configuración de base de datos Neon
  const hasDatabaseConfig = !!(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);

  // Solo usar demo si no hay configuración de BD
  return !hasDatabaseConfig;
};

export const getDemoProject = (id: string): Project | null => {
  return demoProjects.find(p => p.id === id) || null;
};

export const updateDemoProject = (id: string, updates: Partial<Project>): Project | null => {
  const project = getDemoProject(id);
  if (!project) return null;
  
  // Simulate update (in real app, this would persist to database)
  return {
    ...project,
    ...updates,
    updatedAt: new Date()
  };
};

console.log('🎯 Demo data loaded - application running in offline mode');
