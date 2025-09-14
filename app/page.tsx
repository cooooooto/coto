// Dashboard principal de proyectos integrado en la home page

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Project } from '@/types/project';
import DashboardMetrics from '@/components/DashboardMetrics';
import ProjectFilters from '@/components/filters/ProjectFilters';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import { PageSkeleton } from '@/components/ui/LoadingStates';
import { useNotifications } from '@/components/RealtimeNotifications';
import { useProjectFilters } from '@/hooks/useProjectFilters';
import { useProjectOperations } from '@/hooks/useProjectOperations';

function HomeContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const searchParams = useSearchParams();

  const { addNotification } = useNotifications();
  const {
    filters,
    showFilters,
    setShowFilters,
    applyFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters
  } = useProjectFilters();

  const {
    updatingProjects,
    updateProjectStatus,
    updateProjectPhase,
    deleteProject
  } = useProjectOperations({ addNotification });

  // Cargar proyectos
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Error al cargar proyectos');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Manejar parámetro de query para mostrar mensaje de éxito
  useEffect(() => {
    if (searchParams.get('created') === 'true') {
      setShowSuccessMessage(true);
      // Ocultar el mensaje después de 5 segundos
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Aplicar filtros automáticamente
  const filteredProjects = applyFilters(projects);

  // Manejar clics en métricas
  const handleMetricClick = (metricType: string) => {
    const isFilterActive = () => {
      switch (metricType) {
        case 'done':
          return filters.status === 'Done';
        case 'in-progress':
          return filters.status === 'In-Progress';
        case 'overdue':
          return filters.overdue === true;
        case 'all':
          return !hasActiveFilters;
        default:
          return false;
      }
    };

    if (isFilterActive()) {
      clearFilters();
      return;
    }

    const newFilters: Partial<typeof filters> = {};
    switch (metricType) {
      case 'done':
        newFilters.status = 'Done';
        break;
      case 'in-progress':
        newFilters.status = 'In-Progress';
        break;
      case 'overdue':
        newFilters.overdue = true;
        break;
      case 'all':
        clearFilters();
        return;
    }

    updateFilters(newFilters);
  };

  // Handlers simplificados usando hooks
  const handleUpdateStatus = (projectId: string, newStatus: Project['status']) =>
    updateProjectStatus(projectId, newStatus, projects, setProjects);

  const handleUpdatePhase = (projectId: string, newPhase: Project['phase']) =>
    updateProjectPhase(projectId, newPhase, projects, setProjects);

  const handleDelete = (projectId: string) =>
    deleteProject(projectId, projects, setProjects);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900 border border-red-600 rounded-lg p-6 max-w-md mx-auto neon-glow-subtle">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:neon-glow-subtle"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-4 neon-glow-subtle">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-400 font-medium">¡Proyecto creado exitosamente!</span>
          </div>
          <p className="text-green-300 mt-1">Tu nuevo proyecto ha sido agregado al dashboard.</p>
        </div>
      )}

      {/* Componente de Filtros con métricas integradas */}
      <ProjectFilters
        filters={filters}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onUpdateFilters={updateFilters}
        onClearFilters={clearFilters}
        showMetrics={true}
        projects={projects}
        onMetricClick={handleMetricClick}
        activeFilters={{
          status: filters.status,
          overdue: filters.overdue
        }}
      />

      {/* Dashboard Metrics - Ahora están integradas en el componente de filtros */}
      {/* <DashboardMetrics
        projects={projects}
        onMetricClick={handleMetricClick}
        activeFilters={{
          status: filters.status,
          overdue: filters.overdue
        }}
      /> */}

      {/* Grid de Proyectos */}
      <ProjectGrid
        projects={filteredProjects}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePhase={handleUpdatePhase}
        onDelete={handleDelete}
        updatingProjects={updatingProjects}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}