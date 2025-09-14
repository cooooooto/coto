// Dashboard principal de proyectos integrado en la home page

'use client';

import { useState, useEffect, Suspense } from 'react';
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
      {/* Componente de Filtros */}
      <ProjectFilters
        filters={filters}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onUpdateFilters={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* Dashboard Metrics */}
      <DashboardMetrics
        projects={projects}
        onMetricClick={handleMetricClick}
        activeFilters={{
          status: filters.status,
          overdue: filters.overdue
        }}
      />

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