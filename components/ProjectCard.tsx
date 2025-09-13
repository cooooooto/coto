// Componente de tarjeta para mostrar proyectos en el dashboard

'use client';

import Link from 'next/link';
import { Project } from '@/types/project';
import { formatDeadline, isProjectOverdue } from '@/lib/projects';
import ProgressBar from './ProgressBar';
import { StatusBadge, PhaseBadge } from './StatusBadge';

interface ProjectCardProps {
  project: Project;
  onUpdateStatus?: (projectId: string, newStatus: Project['status']) => void;
  onUpdatePhase?: (projectId: string, newPhase: Project['phase']) => void;
  onDelete?: (projectId: string) => void;
}

export default function ProjectCard({ 
  project, 
  onUpdateStatus, 
  onUpdatePhase, 
  onDelete 
}: ProjectCardProps) {
  const isOverdue = isProjectOverdue(project.deadline);
  const completedTasks = project.tasks.filter(task => task.completed).length;

  const handleStatusChange = (newStatus: Project['status']) => {
    if (onUpdateStatus) {
      onUpdateStatus(project.id, newStatus);
    }
  };

  const handlePhaseChange = (newPhase: Project['phase']) => {
    if (onUpdatePhase) {
      onUpdatePhase(project.id, newPhase);
    }
  };

  const getNextStatus = (currentStatus: Project['status']): Project['status'] | null => {
    const statusFlow = ['To-Do', 'In-Progress', 'Done'] as const;
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const getNextPhase = (currentPhase: Project['phase']): Project['phase'] | null => {
    const phaseFlow = ['DEV', 'INT', 'PRE', 'PROD'] as const;
    const currentIndex = phaseFlow.indexOf(currentPhase);
    return currentIndex < phaseFlow.length - 1 ? phaseFlow[currentIndex + 1] : null;
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 sm:p-6 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 neon-glow-subtle hover:neon-glow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/projects/${project.id}`}
            className="text-base sm:text-lg font-semibold text-white hover:text-green-400 transition-colors hover:neon-text block truncate"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
        <StatusBadge status={project.status} />
        <PhaseBadge phase={project.phase} />
        {isOverdue && (
          <span className="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full border border-red-600">
            Vencido
          </span>
        )}
      </div>

      {/* Deadline */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
          <span className="text-xs xs:text-sm text-gray-400">Fecha límite:</span>
          <span className={`text-xs xs:text-sm font-medium ${
            isOverdue ? 'text-red-400' : 'text-white'
          }`}>
            {formatDeadline(project.deadline)}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
          <span>Tareas</span>
          <span>{completedTasks}/{project.tasks.length}</span>
        </div>
        {project.tasks.length > 0 && (
          <div className="space-y-1">
            {project.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-black neon-glow-subtle'
                    : 'border-gray-600'
                }`}>
                  {task.completed && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-300'}>
                  {task.name}
                </span>
              </div>
            ))}
            {project.tasks.length > 3 && (
              <p className="text-xs text-gray-400 ml-6">
                +{project.tasks.length - 3} tareas más
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <ProgressBar progress={project.progress} size="md" />
      </div>

      {/* Actions */}
      <div className="pt-3 sm:pt-4 border-t border-gray-800">
        {/* Mobile: Stack buttons vertically on very small screens */}
        <div className="flex flex-col xs:flex-row xs:flex-wrap gap-2">
          {/* Next Status Button */}
          {getNextStatus(project.status) && (
            <button
              onClick={() => handleStatusChange(getNextStatus(project.status)!)}
              className="text-xs bg-green-900 hover:bg-green-800 text-green-400 px-3 py-2 rounded-full transition-all duration-300 border border-green-600 hover:neon-glow-subtle flex-shrink-0 touch-manipulation"
            >
              → {getNextStatus(project.status)}
            </button>
          )}

          {/* Next Phase Button */}
          {getNextPhase(project.phase) && (
            <button
              onClick={() => handlePhaseChange(getNextPhase(project.phase)!)}
              className="text-xs bg-purple-900 hover:bg-purple-800 text-purple-400 px-3 py-2 rounded-full transition-all duration-300 border border-purple-600 hover:neon-glow-subtle flex-shrink-0 touch-manipulation"
            >
              → {getNextPhase(project.phase)}
            </button>
          )}

          {/* Edit Link */}
          <Link
            href={`/projects/${project.id}/edit`}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full transition-all duration-300 border border-gray-600 hover:border-green-500 flex-shrink-0 touch-manipulation text-center"
          >
            ✏️ Editar
          </Link>

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
                  onDelete(project.id);
                }
              }}
              className="text-xs bg-red-900 hover:bg-red-800 text-red-400 px-3 py-2 rounded-full transition-all duration-300 border border-red-600 hover:neon-glow-subtle flex-shrink-0 touch-manipulation"
            >
              🗑️ Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
