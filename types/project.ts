// Tipos TypeScript para el Dev Project Tracker

export type ProjectStatus = 'To-Do' | 'In-Progress' | 'Done';

export type ProjectPhase = 'DEV' | 'INT' | 'PRE' | 'PROD';

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  deadline: Date;
  status: ProjectStatus;
  phase: ProjectPhase;
  progress: number; // Calculado: % de tareas completadas + avance de fase
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  tasks: Omit<Task, 'id' | 'createdAt'>[];
  deadline: string; // ISO string desde el form
  status: ProjectStatus;
  phase: ProjectPhase;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  tasks?: Task[];
  deadline?: Date;
  status?: ProjectStatus;
  phase?: ProjectPhase;
}

// Filtros para el dashboard
export interface ProjectFilters {
  status?: ProjectStatus;
  phase?: ProjectPhase;
  overdue?: boolean;
  search?: string;
}

// Utilidades para cálculos de progreso
export const PHASE_PROGRESS = {
  'DEV': 25,
  'INT': 50,
  'PRE': 75,
  'PROD': 100
} as const;

export const STATUS_COLORS = {
  'To-Do': 'bg-gray-800 text-gray-300 border-gray-700',
  'In-Progress': 'bg-green-900 text-green-400 border-green-600 neon-glow-subtle',
  'Done': 'bg-lime-900 text-lime-400 border-lime-500 neon-glow-subtle'
} as const;

export const PHASE_COLORS = {
  'DEV': 'bg-purple-900 text-purple-400 border-purple-600',
  'INT': 'bg-yellow-900 text-yellow-400 border-yellow-600',
  'PRE': 'bg-orange-900 text-orange-400 border-orange-600',
  'PROD': 'bg-green-900 text-green-400 border-green-600 neon-glow-subtle'
} as const;
