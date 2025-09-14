// Página de detalle de proyecto individual

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, ProjectPhase } from '@/types/project';
import { formatDeadline, isProjectOverdue, calculateProjectProgress } from '@/lib/projects';
import ProgressBar from '@/components/ProgressBar';
import { StatusBadge, PhaseBadge } from '@/components/StatusBadge';
import PhaseTransitionSemaphore from '@/components/PhaseTransitionSemaphore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNotifications } from '@/components/RealtimeNotifications';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { currentUser, loading: userLoading } = useCurrentUser();
  const { addNotification } = useNotifications();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Cargar proyecto
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Proyecto no encontrado');
        }
        throw new Error('Error al cargar el proyecto');
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Actualizar tarea
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!project || updating) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      setUpdating(true);

      const updatedTasks = project.tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      );

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la tarea');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);

      // Agregar notificación especial si se completa una tarea en fase PROD
      if (completed && project.phase === 'PROD') {
        addNotification(
          'task_completed',
          '🎉 Tarea Finalizada en Producción',
          `La tarea "${task.name}" ha sido completada exitosamente en la fase de Producción del proyecto "${project.name}"`,
          project.name,
          project.id
        );
      } else if (completed) {
        // Notificación normal para otras fases
        addNotification(
          'task_completed',
          'Tarea completada',
          `La tarea "${task.name}" ha sido completada en el proyecto "${project.name}"`,
          project.name,
          project.id
        );
      }
    } catch (err) {
      alert('Error al actualizar la tarea');
    } finally {
      setUpdating(false);
    }
  };

  // Actualizar estado
  const handleUpdateStatus = async (newStatus: Project['status']) => {
    if (!project || updating) return;

    try {
      setUpdating(true);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (err) {
      alert('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  // Actualizar fase
  const handleUpdatePhase = async (newPhase: Project['phase']) => {
    if (!project || updating) return;

    try {
      setUpdating(true);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: newPhase })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la fase');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (err) {
      alert('Error al actualizar la fase');
    } finally {
      setUpdating(false);
    }
  };

  // Eliminar proyecto
  const handleDelete = async () => {
    if (!project || updating) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setUpdating(true);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proyecto');
      }

      router.push('/projects');
    } catch (err) {
      alert('Error al eliminar el proyecto');
      setUpdating(false);
    }
  };

  // Solicitar transición de fase
  const handleRequestTransition = async (toPhase: ProjectPhase, comment?: string) => {
    if (!currentUser || !project) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/transitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhase,
          comment,
          requestedBy: currentUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al solicitar transición');
      }

      // Refrescar proyecto para mostrar la nueva transición
      await fetchProject();
    } catch (err) {
      console.error('Error requesting transition:', err);
      alert(err instanceof Error ? err.message : 'Error al solicitar transición');
      throw err;
    }
  };

  // Revisar transición de fase
  const handleReviewTransition = async (transitionId: string, approved: boolean, comment?: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/transitions/${transitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          reviewedBy: currentUser.id,
          comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al revisar transición');
      }

      // Refrescar proyecto para mostrar los cambios
      await fetchProject();
    } catch (err) {
      console.error('Error reviewing transition:', err);
      alert(err instanceof Error ? err.message : 'Error al revisar transición');
      throw err;
    }
  };

  if (loading || userLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="bg-red-900 border border-red-600 rounded-lg p-6 neon-glow-subtle">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-red-300 mb-4">{error || 'Proyecto no encontrado'}</p>
            <Link
              href="/projects"
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:neon-glow-subtle"
            >
              Volver a Proyectos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = isProjectOverdue(project.deadline);
  const completedTasks = project.tasks.filter(task => task.completed).length;
  const prodCompletedTasks = project.tasks.filter(task => task.completed && project.phase === 'PROD');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/projects" className="hover:text-green-400 transition-colors">
          Proyectos
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="truncate">{project.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 neon-glow-subtle p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 neon-text">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">{project.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${project.id}/edit`}
              className="bg-green-900 hover:bg-green-800 text-green-400 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 border border-green-600 hover:neon-glow-subtle"
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              disabled={updating}
              className="bg-red-900 hover:bg-red-800 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 border border-red-600 hover:neon-glow-subtle disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Badges and Info */}
        <div className="flex items-center gap-4 mb-6">
          <StatusBadge status={project.status} />
          <PhaseBadge phase={project.phase} />
          
          <div className="text-sm text-gray-300">
            <span>Fecha límite: </span>
            <span className={`font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
              {formatDeadline(project.deadline)}
            </span>
            {isOverdue && (
              <span className="ml-2 bg-red-900 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-600">
                Vencido
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Progreso General</span>
            <span className="text-sm text-gray-400">{completedTasks}/{project.tasks.length} tareas</span>
          </div>
          <ProgressBar progress={project.progress} size="lg" />
        </div>
      </div>

      {/* Phase Transition Semaphore */}
      {currentUser && (
        <PhaseTransitionSemaphore
          project={project}
          currentUser={currentUser}
          onRequestTransition={handleRequestTransition}
          onReviewTransition={handleReviewTransition}
        />
      )}

      {/* Project Details */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 neon-glow-subtle p-6">
        {/* Quick Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
          <span className="text-sm font-medium text-gray-300">Acciones rápidas:</span>
          
          {/* Status Controls */}
          <select
            value={project.status}
            onChange={(e) => handleUpdateStatus(e.target.value as Project['status'])}
            disabled={updating}
            className="text-sm border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-1 focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle disabled:opacity-50"
          >
            <option value="To-Do">To-Do</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Phase Controls */}
          <select
            value={project.phase}
            onChange={(e) => handleUpdatePhase(e.target.value as Project['phase'])}
            disabled={updating}
            className="text-sm border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-1 focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle disabled:opacity-50"
          >
            <option value="DEV">Desarrollo</option>
            <option value="INT">Integración</option>
            <option value="PRE">Pre-Producción</option>
            <option value="PROD">Producción</option>
          </select>
        </div>
      </div>

      {/* Completed Tasks in Production - Special Section */}
      {project.phase === 'PROD' && prodCompletedTasks.length > 0 && (
        <div className="bg-gradient-to-r from-green-900 to-lime-900 rounded-lg border border-green-600 neon-glow-subtle p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white neon-text">
              🎉 Tareas Finalizadas en Producción ({prodCompletedTasks.length})
            </h2>
          </div>

          <div className="space-y-3">
            {prodCompletedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-green-500 bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                <span className="flex-1 text-green-800 dark:text-green-200 font-medium">
                  {task.name}
                </span>

                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <span>✅ Finalizada</span>
                  <span>•</span>
                  <span>{new Date(task.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 neon-glow-subtle p-6">
        <h2 className="text-xl font-semibold text-white mb-4 neon-text">
          Tareas ({
            project.phase === 'PROD'
              ? `${project.tasks.filter(t => !t.completed).length}/${project.tasks.length}`
              : `${completedTasks}/${project.tasks.length}`
          })
        </h2>
        
        {project.tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay tareas definidas para este proyecto.</p>
        ) : (
          <div className="space-y-3">
            {project.tasks
              // Filtrar tareas que ya están en "finalizadas" si estamos en PROD
              .filter(task => !(project.phase === 'PROD' && task.completed))
              .map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  task.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task.id, !task.completed)}
                  disabled={updating}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-black neon-glow-subtle'
                      : 'border-gray-600 hover:border-green-500'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {task.name}
                </span>

                <span className="text-xs text-gray-400">
                  {new Date(task.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 neon-glow-subtle p-6">
        <h2 className="text-xl font-semibold text-white mb-4 neon-text">Información del Proyecto</h2>
        
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-300">Creado</dt>
            <dd className="text-gray-400 mt-1">
              {new Date(project.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </dd>
          </div>
          
          <div>
            <dt className="font-medium text-gray-300">Última actualización</dt>
            <dd className="text-gray-400 mt-1">
              {new Date(project.updatedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </dd>
          </div>
          
          <div>
            <dt className="font-medium text-gray-300">ID del Proyecto</dt>
            <dd className="text-gray-400 mt-1 font-mono text-xs">{project.id}</dd>
          </div>
          
          <div>
            <dt className="font-medium text-gray-300">Progreso calculado</dt>
            <dd className="text-gray-400 mt-1">{project.progress}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
