// Página para editar un proyecto existente

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '@/components/ProjectForm';
import { Project, CreateProjectData } from '@/types/project';
import { generateId } from '@/lib/projects';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Manejar envío del formulario
  const handleSubmit = async (data: CreateProjectData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          deadline: new Date(data.deadline),
          status: data.status,
          phase: data.phase,
          tasks: data.tasks.map(task => ({
            ...task,
            id: generateId(),
            createdAt: new Date()
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el proyecto');
      }

      // Redirigir al detalle del proyecto
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 neon-glow-subtle p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
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

  return (
    <div className="max-w-4xl mx-auto"> {/* Fixed TypeScript error */}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/projects" className="hover:text-green-400 transition-colors">
            Proyectos
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link 
            href={`/projects/${projectId}`} 
            className="hover:text-green-400 transition-colors truncate"
          >
            {project.name}
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Editar</span>
        </div>

        <h1 className="text-3xl font-bold text-white neon-text">Editar Proyecto</h1>
        <p className="text-gray-300 mt-2">
          Actualiza la información, tareas y configuración de tu proyecto.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6 neon-glow-subtle">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400 font-medium">Error al actualizar el proyecto</span>
          </div>
          <p className="text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 neon-glow-subtle p-6">
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3 neon-text">
          Información importante
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>Tareas:</strong> Al editar tareas, las marcadas como completadas mantendrán su estado.</p>
          <p><strong>Progreso:</strong> Se recalculará automáticamente basado en las tareas y fase actual.</p>
          <p><strong>Historial:</strong> Los cambios actualizarán la fecha de &ldquo;última modificación&rdquo;.</p>
        </div>
      </div>
    </div>
  );
}
