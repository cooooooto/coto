// Utilidades para manejo de proyectos y cálculos de progreso

import { Project, Task, PHASE_PROGRESS } from '@/types/project';

/**
 * Calcula el progreso total de un proyecto basado en tareas completadas y fase actual
 */
export function calculateProjectProgress(project: Project): number {
  if (!project.tasks || project.tasks.length === 0) {
    return PHASE_PROGRESS[project.phase];
  }

  const completedTasks = project.tasks.filter(task => task.completed).length;
  const taskProgress = (completedTasks / project.tasks.length) * 70; // 70% del progreso viene de tareas
  const phaseProgress = PHASE_PROGRESS[project.phase] * 0.3; // 30% del progreso viene de la fase

  return Math.round(taskProgress + phaseProgress);
}

/**
 * Verifica si un proyecto está vencido
 */
export function isProjectOverdue(deadline: Date): boolean {
  return new Date() > new Date(deadline);
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatDeadline(deadline: Date): string {
  return new Date(deadline).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Genera un ID único para proyectos y tareas
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Valida los datos de un proyecto antes de guardarlo
 */
export function validateProjectData(data: any): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('El nombre del proyecto es obligatorio');
  }

  if (!data.deadline) {
    errors.push('La fecha límite es obligatoria');
  } else {
    const deadline = new Date(data.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push('La fecha límite no es válida');
    }
  }

  if (!['To-Do', 'In-Progress', 'Done'].includes(data.status)) {
    errors.push('El estado del proyecto no es válido');
  }

  if (!['DEV', 'INT', 'PRE', 'PROD'].includes(data.phase)) {
    errors.push('La fase del proyecto no es válida');
  }

  return errors;
}

/**
 * Ordena proyectos por prioridad (vencidos primero, luego por fecha límite)
 */
export function sortProjectsByPriority(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aOverdue = isProjectOverdue(a.deadline);
    const bOverdue = isProjectOverdue(b.deadline);

    // Proyectos vencidos van primero
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Si ambos están vencidos o ninguno, ordenar por fecha límite
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
