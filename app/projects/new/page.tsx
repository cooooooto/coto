// Página para crear un nuevo proyecto

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
import ProjectTemplates from '@/components/ProjectTemplates';
import { CreateProjectData } from '@/types/project';
import { ProjectTemplate, createProjectFromTemplate } from '@/lib/project-templates';
import Link from 'next/link';

export default function NewProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [initialData, setInitialData] = useState<CreateProjectData | null>(null);
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

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    
    // Crear datos iniciales desde el template
    const templateData = createProjectFromTemplate(
      template.id,
      `Nuevo ${template.name}`,
      template.description
    );
    
    if (templateData) {
      setInitialData(templateData);
    }
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    setInitialData(null);
  };

  return (
    <>
      {showTemplates && (
        <ProjectTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Nuevo Proyecto</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {selectedTemplate 
                ? `Usando template: ${selectedTemplate.name}`
                : 'Configura tu nuevo proyecto de desarrollo con tareas, fases y fechas límite.'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <button
                onClick={handleStartFromScratch}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                Empezar desde cero
              </button>
            )}
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg shadow-green-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Usar Template
            </button>
          </div>
        </div>
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

      {/* Template Info */}
      {selectedTemplate && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{selectedTemplate.icon}</span>
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                {selectedTemplate.name}
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                {selectedTemplate.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-green-600 dark:text-green-400">
                <span>⏱️ {selectedTemplate.estimatedDuration}</span>
                <span>📋 {selectedTemplate.defaultData.tasks.length} tareas incluidas</span>
                <span>🎯 {selectedTemplate.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg shadow-gray-900/10">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          initialData={initialData}
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
    </>
  );
}
