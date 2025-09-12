// Página para crear un nuevo proyecto

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
import { CreateProjectData } from '@/types/project';
import Link from 'next/link';

export default function NewProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: CreateProjectData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el proyecto');
      }

      const newProject = await response.json();
      
      // Redirigir al dashboard con un mensaje de éxito
      router.push('/projects?created=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link 
            href="/projects" 
            className="hover:text-green-400 transition-colors"
          >
            Proyectos
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Nuevo Proyecto</span>
        </div>

        <h1 className="text-3xl font-bold text-white neon-text">Crear Nuevo Proyecto</h1>
        <p className="text-gray-300 mt-2">
          Configura tu nuevo proyecto de desarrollo con tareas, fases y fechas límite.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6 neon-glow-subtle">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400 font-medium">Error al crear el proyecto</span>
          </div>
          <p className="text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 neon-glow-subtle">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-green-400 mb-3 neon-text">
          Consejos para tu proyecto
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>Tareas:</strong> Divide tu proyecto en tareas específicas y alcanzables.</p>
          <p><strong>Fases:</strong> DEV (desarrollo inicial) → INT (integración) → PRE (testing) → PROD (producción).</p>
          <p><strong>Estados:</strong> To-Do → In-Progress → Done para tracking diario.</p>
          <p><strong>Fechas límite:</strong> Establece fechas realistas considerando la complejidad.</p>
        </div>
      </div>
    </div>
  );
}
