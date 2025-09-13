// Tipos TypeScript para el Dev Project Tracker

export type ProjectStatus = 'To-Do' | 'In-Progress' | 'Done';

export type ProjectPhase = 'DEV' | 'INT' | 'PRE' | 'PROD';

export type UserRole = 'admin' | 'member' | 'viewer';

export type ProjectMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  assigned_to?: string; // Profile ID
  assignee?: Profile; // Populated from join
  createdAt: Date;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: Date;
  profile?: Profile; // Populated from join
}

export interface Comment {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  user?: Profile; // Populated from join
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
  requires_approval: boolean;
  current_transition_id?: string;
  owner_id: string;
  owner?: Profile; // Populated from join
  members?: ProjectMember[]; // Populated from join
  comments?: Comment[]; // Populated from join
  current_transition?: PhaseTransition; // Populated from join
  pending_transitions?: PhaseTransition[]; // Populated from join
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
  'To-Do': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700',
  'In-Progress': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 neon-glow-subtle',
  'Done': 'bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-400 border-lime-300 dark:border-lime-500 neon-glow-subtle'
} as const;

export const PHASE_COLORS = {
  'DEV': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-600',
  'INT': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600',
  'PRE': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-600',
  'PROD': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 neon-glow-subtle'
} as const;

// Types for phase transitions
export type TransitionStatus = 'pending' | 'approved' | 'rejected';

export interface PhaseTransition {
  id: string;
  project_id: string;
  from_phase: ProjectPhase | null;
  to_phase: ProjectPhase;
  status: TransitionStatus;
  requested_by: string;
  approved_by?: string;
  comment?: string;
  requested_at: Date;
  reviewed_at?: Date;
  requester?: Profile; // Populated from join
  approver?: Profile; // Populated from join
  created_at: Date;
}

export const TRANSITION_COLORS = {
  'pending': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600 animate-pulse',
  'approved': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600',
  'rejected': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 border-red-300 dark:border-red-600'
} as const;
