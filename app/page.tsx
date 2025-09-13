// Dashboard principal de proyectos integrado en la home page

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Project, ProjectFilters } from '@/types/project';
import { sortProjectsByPriority } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';
import DashboardMetrics from '@/components/DashboardMetrics';
import FloatingActionButton from '@/components/FloatingActionButton';
import Link from 'next/link';
import { useNotifications } from '@/components/RealtimeNotifications';

function HomeContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set());

  const searchParams = useSearchParams();
  const router = useRouter();
  const { addNotification } = useNotifications();

  // Estado de filtros
  const [filters, setFilters] = useState<ProjectFilters>({
    status: searchParams.get('status') as Project['status'] || undefined,
    phase: searchParams.get('phase') as Project['phase'] || undefined,
    overdue: searchParams.get('overdue') === 'true' || undefined,
    search: searchParams.get('search') || undefined
  });

  // Estado para controlar la visibilidad de los filtros
  const [showFilters, setShowFilters] = useState(false);

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

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...projects];

    // Filtro automático: ocultar proyectos completados por defecto
    // Solo mostrar proyectos completados si el usuario filtra específicamente por estado "Done"
    const hasActiveFilters = Object.values(filters).some(value =>
      value !== undefined && value !== '' && value !== false
    );

    if (!hasActiveFilters) {
      // Si no hay filtros activos, ocultar proyectos completados
      filtered = filtered.filter(project => project.status !== 'Done');
    } else {
      // Si hay filtros activos, aplicar filtros normales
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
    }

    // Filtro por búsqueda (siempre se aplica)
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
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.replace(newUrl);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    router.replace('/');
  };

  // Manejar clics en métricas
  const handleMetricClick = (metricType: string) => {
    // Verificar si el filtro ya está aplicado
    const isFilterActive = () => {
      switch (metricType) {
        case 'done':
          return filters.status === 'Done';
        case 'in-progress':
          return filters.status === 'In-Progress';
        case 'overdue':
          return filters.overdue === true;
        case 'all':
          return Object.values(filters).every(value =>
            value === undefined || value === '' || value === false
          );
        default:
          return false;
      }
    };

    // Si el filtro ya está activo, quitarlo (limpiar filtros)
    if (isFilterActive()) {
      clearFilters();
      return;
    }

    // Si no está activo, aplicarlo
    const newFilters: Partial<ProjectFilters> = {};

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
        // Para 'all' si no está activo, limpiar filtros
        clearFilters();
        return;
      default:
        return;
    }

    updateFilters(newFilters);
  };

  // Manejar actualización de estado
  const handleUpdateStatus = async (projectId: string, newStatus: Project['status']) => {
    if (updatingProjects.has(projectId)) return; // Evitar múltiples clics

    setUpdatingProjects(prev => new Set([...prev, projectId]));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      const updatedProject = await response.json();
      const project = projects.find(p => p.id === projectId);

      setProjects(projects.map(project =>
        project.id === projectId ? updatedProject : project
      ));

      // Agregar notificación de actualización de estado
      if (project) {
        addNotification(
          'project_updated',
          'Estado del proyecto actualizado',
          `El proyecto "${project.name}" cambió a estado "${newStatus}"`,
          project.name,
          project.id
        );
      }
    } catch (err) {
      alert('Error al actualizar el estado del proyecto');
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  // Manejar actualización de fase
  const handleUpdatePhase = async (projectId: string, newPhase: Project['phase']) => {
    if (updatingProjects.has(projectId)) return; // Evitar múltiples clics

    setUpdatingProjects(prev => new Set([...prev, projectId]));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: newPhase })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la fase');
      }

      const updatedProject = await response.json();
      const project = projects.find(p => p.id === projectId);

      setProjects(projects.map(project =>
        project.id === projectId ? updatedProject : project
      ));

      // Agregar notificación de actualización de fase
      if (project) {
        addNotification(
          'project_updated',
          'Fase del proyecto actualizada',
          `El proyecto "${project.name}" avanzó a fase "${newPhase}"`,
          project.name,
          project.id
        );
      }
    } catch (err) {
      alert('Error al actualizar la fase del proyecto');
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  // Manejar eliminación
  const handleDelete = async (projectId: string) => {
    if (updatingProjects.has(projectId)) return; // Evitar múltiples clics

    setUpdatingProjects(prev => new Set([...prev, projectId]));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proyecto');
      }

      const project = projects.find(p => p.id === projectId);
      setProjects(projects.filter(project => project.id !== projectId));

      // Agregar notificación de eliminación
      if (project) {
        addNotification(
          'project_deleted',
          'Proyecto eliminado',
          `El proyecto "${project.name}" ha sido eliminado`,
          project.name,
          project.id
        );
      }
    } catch (err) {
      alert('Error al eliminar el proyecto');
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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
            onClick={fetchProjects}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:neon-glow-subtle"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Botón para mostrar/ocultar filtros */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 border border-gray-300 dark:border-gray-600"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(value => value !== undefined && value !== '').length}
              </span>
            )}
          </button>

          {/* Mostrar filtros activos de manera resumida */}
          {hasActiveFilters && (
            <div className="flex gap-2 flex-wrap">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  🔍 {filters.search.length > 15 ? `${filters.search.substring(0, 15)}...` : filters.search}
                  <button
                    onClick={() => updateFilters({ search: undefined })}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                  Estado: {filters.status}
                  <button
                    onClick={() => updateFilters({ status: undefined })}
                    className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.phase && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                  Fase: {filters.phase}
                  <button
                    onClick={() => updateFilters({ phase: undefined })}
                    className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.overdue && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs">
                  Solo vencidos
                  <button
                    onClick={() => updateFilters({ overdue: undefined })}
                    className="ml-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Limpiar todos los filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Panel de filtros desplegable */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              placeholder="Buscar proyectos..."
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-green-500 focus:border-green-500"
            />

            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as Project['status'] || undefined })}
              className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los estados</option>
              <option value="To-Do">To-Do</option>
              <option value="In-Progress">En Progreso</option>
              <option value="Done">Completado</option>
            </select>

            <select
              value={filters.phase || ''}
              onChange={(e) => updateFilters({ phase: e.target.value as Project['phase'] || undefined })}
              className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todas las fases</option>
              <option value="DEV">Desarrollo</option>
              <option value="INT">Integración</option>
              <option value="PRE">Pre-Producción</option>
              <option value="PROD">Producción</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.overdue || false}
                onChange={(e) => updateFilters({ overdue: e.target.checked || undefined })}
                className="rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Vencidos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics
        projects={projects}
        onMetricClick={handleMetricClick}
        activeFilters={{
          status: filters.status,
          overdue: filters.overdue
        }}
      />

      {/* Lista de proyectos */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              {projects.length === 0 ? 'No hay proyectos' : 'No se encontraron proyectos'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 px-2">
              {projects.length === 0 
                ? 'Comienza creando tu primer proyecto de desarrollo.'
                : 'Intenta ajustar los filtros para encontrar lo que buscas.'
              }
            </p>
            {projects.length === 0 && (
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 neon-glow hover:neon-pulse touch-manipulation"
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePhase={handleUpdatePhase}
              onDelete={handleDelete}
              isUpdating={updatingProjects.has(project.id)}
            />
          ))}
        </div>
      )}
      
      {/* Floating Action Button para móvil */}
      <FloatingActionButton 
        href="/projects/new"
        label="Crear nuevo proyecto"
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}