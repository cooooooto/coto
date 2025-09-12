// Dashboard principal de proyectos con filtros y gestión

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Project, ProjectFilters } from '@/types/project';
import { sortProjectsByPriority } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';
import DashboardMetrics from '@/components/DashboardMetrics';
import RealtimeStatus, { RealtimeStatusIcon } from '@/components/RealtimeStatus';
import { useRealtimeProjects } from '@/hooks/useRealtimeProjects';
import Link from 'next/link';

function ProjectsContent() {
  // Usar el hook de realtime en lugar del estado local
  const { 
    projects, 
    loading, 
    error, 
    refreshProjects, 
    isConnected 
  } = useRealtimeProjects();
  
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [showMetrics, setShowMetrics] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estado de filtros
  const [filters, setFilters] = useState<ProjectFilters>({
    status: searchParams.get('status') as Project['status'] || undefined,
    phase: searchParams.get('phase') as Project['phase'] || undefined,
    overdue: searchParams.get('overdue') === 'true' || undefined,
    search: searchParams.get('search') || undefined
  });

  // Los proyectos se cargan automáticamente con el hook useRealtimeProjects

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...projects];

    // Filtro por estado
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Filtro por fase
    if (filters.phase) {
      filtered = filtered.filter(project => project.phase === filters.phase);
    }

    // Filtro por vencidos
    if (filters.overdue) {
      filtered = filtered.filter(project => new Date() > new Date(project.deadline));
    }

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchLower) ||
        (project.description && project.description.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por prioridad
    setFilteredProjects(sortProjectsByPriority(filtered));
  }, [projects, filters]);

  // Actualizar URL con filtros
  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Construir query string
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });

    // Actualizar URL sin recargar la página
    const newUrl = params.toString() ? `/projects?${params.toString()}` : '/projects';
    router.replace(newUrl);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    router.replace('/projects');
  };

  // Manejar actualización de estado
  const handleUpdateStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      // El proyecto se actualizará automáticamente via realtime
      // Solo refrescamos si hay algún problema con la conexión
      if (!isConnected) {
        await refreshProjects();
      }
    } catch (err) {
      alert('Error al actualizar el estado del proyecto');
    }
  };

  // Manejar actualización de fase
  const handleUpdatePhase = async (projectId: string, newPhase: Project['phase']) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: newPhase })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la fase');
      }

      // El proyecto se actualizará automáticamente via realtime
      if (!isConnected) {
        await refreshProjects();
      }
    } catch (err) {
      alert('Error al actualizar la fase del proyecto');
    }
  };

  // Manejar eliminación
  const handleDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proyecto');
      }

      // El proyecto se eliminará automáticamente via realtime
      if (!isConnected) {
        await refreshProjects();
      }
    } catch (err) {
      alert('Error al eliminar el proyecto');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 rounded-lg border border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900 border border-red-600 rounded-lg p-6 max-w-md mx-auto neon-glow-subtle">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={refreshProjects}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <>
      <RealtimeStatus isConnected={isConnected} error={error} />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white neon-text">Mis Proyectos</h1>
          <p className="text-gray-300 mt-1">
            {filteredProjects.length} de {projects.length} proyectos
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <RealtimeStatusIcon isConnected={isConnected} error={error} />
          
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showMetrics ? 'Ocultar' : 'Mostrar'} Métricas
          </button>
          
          <Link
            href="/projects/new"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      {/* Dashboard Metrics */}
      {showMetrics && (
        <div className="animate-fade-in-up">
          <DashboardMetrics projects={projects} />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 neon-glow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              placeholder="Nombre o descripción..."
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Estado
            </label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as Project['status'] || undefined })}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
            >
              <option value="">Todos los estados</option>
              <option value="To-Do">To-Do</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Filtro por fase */}
          <div>
            <label htmlFor="phase" className="block text-sm font-medium text-gray-300 mb-1">
              Fase
            </label>
            <select
              id="phase"
              value={filters.phase || ''}
              onChange={(e) => updateFilters({ phase: e.target.value as Project['phase'] || undefined })}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
            >
              <option value="">Todas las fases</option>
              <option value="DEV">Desarrollo</option>
              <option value="INT">Integración</option>
              <option value="PRE">Pre-Producción</option>
              <option value="PROD">Producción</option>
            </select>
          </div>

          {/* Filtro por vencidos */}
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.overdue || false}
                onChange={(e) => updateFilters({ overdue: e.target.checked || undefined })}
                className="rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-800"
              />
              <span className="text-sm font-medium text-gray-700">Solo vencidos</span>
            </label>
          </div>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de proyectos */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">
              {projects.length === 0 ? 'No hay proyectos' : 'No se encontraron proyectos'}
            </h3>
            <p className="text-gray-300 mb-6">
              {projects.length === 0 
                ? 'Comienza creando tu primer proyecto de desarrollo.'
                : 'Intenta ajustar los filtros para encontrar lo que buscas.'
              }
            </p>
            {projects.length === 0 && (
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 neon-glow hover:neon-pulse"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear mi primer proyecto
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePhase={handleUpdatePhase}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white neon-text">Proyectos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 rounded-lg border border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
