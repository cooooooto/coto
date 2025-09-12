// Templates predefinidos para diferentes tipos de proyectos

import { CreateProjectData, ProjectStatus, ProjectPhase } from '@/types/project';
import { generateId } from './projects';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'api' | 'fullstack' | 'data' | 'devops';
  icon: string;
  estimatedDuration: string; // e.g., "2-3 months"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  defaultData: Omit<CreateProjectData, 'name' | 'description'>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-webapp',
    name: 'React Web Application',
    description: 'Aplicación web moderna con React, TypeScript y Tailwind CSS',
    category: 'web',
    icon: '⚛️',
    estimatedDuration: '1-2 months',
    difficulty: 'intermediate',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    defaultData: {
      tasks: [
        { name: 'Setup del proyecto con Vite + React + TypeScript', completed: false },
        { name: 'Configuración de Tailwind CSS y estructura base', completed: false },
        { name: 'Implementar sistema de routing con React Router', completed: false },
        { name: 'Crear componentes base y layout principal', completed: false },
        { name: 'Implementar manejo de estado (Context/Redux)', completed: false },
        { name: 'Integrar API y manejo de datos', completed: false },
        { name: 'Implementar autenticación y autorización', completed: false },
        { name: 'Testing unitario y de integración', completed: false },
        { name: 'Optimización y build para producción', completed: false },
        { name: 'Deploy y configuración CI/CD', completed: false }
      ],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack App',
    description: 'Aplicación completa con Next.js, API routes y base de datos',
    category: 'fullstack',
    icon: '🔥',
    estimatedDuration: '2-3 months',
    difficulty: 'advanced',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
    defaultData: {
      tasks: [
        { name: 'Setup de Next.js 15 con App Router y TypeScript', completed: false },
        { name: 'Configuración de base de datos con Prisma + PostgreSQL', completed: false },
        { name: 'Implementar autenticación con NextAuth.js', completed: false },
        { name: 'Crear API routes para CRUD operations', completed: false },
        { name: 'Diseñar UI/UX con Tailwind CSS y componentes', completed: false },
        { name: 'Implementar middleware y validaciones', completed: false },
        { name: 'Sistema de uploads y manejo de archivos', completed: false },
        { name: 'Implementar real-time features (WebSockets)', completed: false },
        { name: 'Testing E2E con Playwright', completed: false },
        { name: 'Optimización SEO y performance', completed: false },
        { name: 'Deploy en Vercel con configuración de dominio', completed: false }
      ],
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'react-native-app',
    name: 'React Native Mobile App',
    description: 'Aplicación móvil multiplataforma con React Native y Expo',
    category: 'mobile',
    icon: '📱',
    estimatedDuration: '2-4 months',
    difficulty: 'advanced',
    technologies: ['React Native', 'Expo', 'TypeScript', 'Redux Toolkit'],
    defaultData: {
      tasks: [
        { name: 'Setup de React Native con Expo y TypeScript', completed: false },
        { name: 'Configuración de navegación con React Navigation', completed: false },
        { name: 'Implementar manejo de estado con Redux Toolkit', completed: false },
        { name: 'Crear componentes UI nativos y tema consistente', completed: false },
        { name: 'Integrar APIs y manejo de datos offline', completed: false },
        { name: 'Implementar autenticación y seguridad', completed: false },
        { name: 'Funcionalidades nativas (cámara, GPS, notificaciones)', completed: false },
        { name: 'Testing en dispositivos iOS y Android', completed: false },
        { name: 'Optimización de performance y bundle size', completed: false },
        { name: 'Publicación en App Store y Google Play', completed: false }
      ],
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'express-api',
    name: 'Node.js REST API',
    description: 'API RESTful robusta con Node.js, Express y MongoDB',
    category: 'api',
    icon: '🚀',
    estimatedDuration: '1-2 months',
    difficulty: 'intermediate',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Swagger'],
    defaultData: {
      tasks: [
        { name: 'Setup de Node.js + Express + TypeScript', completed: false },
        { name: 'Configuración de MongoDB y modelos con Mongoose', completed: false },
        { name: 'Implementar autenticación JWT y middleware', completed: false },
        { name: 'Crear endpoints CRUD para recursos principales', completed: false },
        { name: 'Implementar validaciones con Joi/Zod', completed: false },
        { name: 'Sistema de manejo de errores y logging', completed: false },
        { name: 'Documentación API con Swagger/OpenAPI', completed: false },
        { name: 'Testing unitario e integración con Jest', completed: false },
        { name: 'Implementar rate limiting y seguridad', completed: false },
        { name: 'Deploy en AWS/Heroku con CI/CD', completed: false }
      ],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'python-ml',
    name: 'Machine Learning Project',
    description: 'Proyecto de ML con Python, scikit-learn y análisis de datos',
    category: 'data',
    icon: '🤖',
    estimatedDuration: '2-3 months',
    difficulty: 'advanced',
    technologies: ['Python', 'scikit-learn', 'pandas', 'Jupyter', 'FastAPI'],
    defaultData: {
      tasks: [
        { name: 'Setup del entorno Python con virtual environment', completed: false },
        { name: 'Exploración y limpieza de datos con pandas', completed: false },
        { name: 'Análisis exploratorio de datos (EDA) en Jupyter', completed: false },
        { name: 'Feature engineering y selección de variables', completed: false },
        { name: 'Entrenamiento de modelos ML con scikit-learn', completed: false },
        { name: 'Evaluación y optimización de hyperparámetros', completed: false },
        { name: 'Validación cruzada y métricas de performance', completed: false },
        { name: 'Crear API para servir el modelo con FastAPI', completed: false },
        { name: 'Implementar monitoring y logging del modelo', completed: false },
        { name: 'Deploy del modelo en producción (AWS/GCP)', completed: false }
      ],
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'vue-spa',
    name: 'Vue.js SPA',
    description: 'Single Page Application con Vue 3, Composition API y Pinia',
    category: 'web',
    icon: '💚',
    estimatedDuration: '1-2 months',
    difficulty: 'intermediate',
    technologies: ['Vue 3', 'TypeScript', 'Pinia', 'Vue Router', 'Vite'],
    defaultData: {
      tasks: [
        { name: 'Setup de Vue 3 + Vite + TypeScript', completed: false },
        { name: 'Configuración de Vue Router para SPA', completed: false },
        { name: 'Implementar manejo de estado con Pinia', completed: false },
        { name: 'Crear componentes con Composition API', completed: false },
        { name: 'Integrar UI framework (Vuetify/PrimeVue)', completed: false },
        { name: 'Implementar autenticación y guards de ruta', completed: false },
        { name: 'Conectar con APIs y manejo de datos', completed: false },
        { name: 'Testing con Vue Test Utils y Vitest', completed: false },
        { name: 'Optimización y lazy loading de rutas', completed: false },
        { name: 'Build y deploy en Netlify/Vercel', completed: false }
      ],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'docker-microservices',
    name: 'Microservices Architecture',
    description: 'Arquitectura de microservicios con Docker, Kubernetes y API Gateway',
    category: 'devops',
    icon: '🐳',
    estimatedDuration: '3-4 months',
    difficulty: 'advanced',
    technologies: ['Docker', 'Kubernetes', 'NGINX', 'Redis', 'PostgreSQL'],
    defaultData: {
      tasks: [
        { name: 'Diseño de arquitectura de microservicios', completed: false },
        { name: 'Setup de servicios base con Docker Compose', completed: false },
        { name: 'Implementar API Gateway con NGINX', completed: false },
        { name: 'Crear servicios independientes (Auth, Users, Orders)', completed: false },
        { name: 'Configurar comunicación entre servicios (gRPC/REST)', completed: false },
        { name: 'Implementar service discovery y load balancing', completed: false },
        { name: 'Setup de bases de datos por servicio', completed: false },
        { name: 'Configurar logging centralizado (ELK Stack)', completed: false },
        { name: 'Implementar monitoring con Prometheus + Grafana', completed: false },
        { name: 'Deploy en Kubernetes cluster', completed: false }
      ],
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  },
  {
    id: 'flutter-app',
    name: 'Flutter Mobile App',
    description: 'Aplicación móvil nativa con Flutter y Dart',
    category: 'mobile',
    icon: '🎯',
    estimatedDuration: '2-3 months',
    difficulty: 'intermediate',
    technologies: ['Flutter', 'Dart', 'Firebase', 'Provider/Bloc'],
    defaultData: {
      tasks: [
        { name: 'Setup de Flutter SDK y proyecto base', completed: false },
        { name: 'Configuración de Firebase para backend', completed: false },
        { name: 'Implementar navegación y routing', completed: false },
        { name: 'Crear widgets personalizados y tema', completed: false },
        { name: 'Integrar autenticación con Firebase Auth', completed: false },
        { name: 'Implementar manejo de estado (Provider/Bloc)', completed: false },
        { name: 'Conectar con Firestore para datos en tiempo real', completed: false },
        { name: 'Implementar funcionalidades nativas', completed: false },
        { name: 'Testing de widgets y integración', completed: false },
        { name: 'Build y publicación en stores', completed: false }
      ],
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
      status: 'To-Do' as ProjectStatus,
      phase: 'DEV' as ProjectPhase
    }
  }
];

// Función para obtener templates por categoría
export function getTemplatesByCategory(category?: string): ProjectTemplate[] {
  if (!category) return PROJECT_TEMPLATES;
  return PROJECT_TEMPLATES.filter(template => template.category === category);
}

// Función para obtener template por ID
export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(template => template.id === id);
}

// Función para crear proyecto desde template
export function createProjectFromTemplate(
  templateId: string,
  projectName: string,
  projectDescription?: string,
  customDeadline?: string
): CreateProjectData | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  return {
    name: projectName,
    description: projectDescription || template.description,
    tasks: template.defaultData.tasks.map(task => ({
      ...task,
      id: generateId(),
      createdAt: new Date()
    })),
    deadline: customDeadline || template.defaultData.deadline,
    status: template.defaultData.status,
    phase: template.defaultData.phase
  };
}

// Categorías disponibles con información
export const TEMPLATE_CATEGORIES = {
  web: {
    name: 'Web Development',
    icon: '🌐',
    description: 'Aplicaciones web modernas con frameworks populares'
  },
  mobile: {
    name: 'Mobile Development',
    icon: '📱',
    description: 'Aplicaciones móviles nativas y multiplataforma'
  },
  api: {
    name: 'API Development',
    icon: '🚀',
    description: 'APIs RESTful y GraphQL robustas'
  },
  fullstack: {
    name: 'Full-Stack',
    icon: '🔥',
    description: 'Aplicaciones completas frontend + backend'
  },
  data: {
    name: 'Data Science',
    icon: '📊',
    description: 'Proyectos de análisis de datos y machine learning'
  },
  devops: {
    name: 'DevOps',
    icon: '⚙️',
    description: 'Infraestructura, CI/CD y arquitecturas escalables'
  }
} as const;
