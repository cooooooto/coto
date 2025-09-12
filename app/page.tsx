// Dashboard principal de proyectos integrado en la home page

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Project, ProjectFilters } from '@/types/project';
import { sortProjectsByPriority } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import Link from 'next/link';

function HomeContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estado de filtros
  const [filters, setFilters] = useState<ProjectFilters>({
    status: searchParams.get('status') as Project['status'] || undefined,
    phase: searchParams.get('phase') as Project['phase'] || undefined,
    overdue: searchParams.get('overdue') === 'true' || undefined,
    search: searchParams.get('search') || undefined
  });

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
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.replace(newUrl);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    router.replace('/');
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

      const updatedProject = await response.json();
      setProjects(projects.map(project => 
        project.id === projectId ? updatedProject : project
      ));
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

      const updatedProject = await response.json();
      setProjects(projects.map(project => 
        project.id === projectId ? updatedProject : project
      ));
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

      setProjects(projects.filter(project => project.id !== projectId));
    } catch (err) {
      alert('Error al eliminar el proyecto');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white neon-text">Dashboard</h1>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white neon-text">Dashboard</h1>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            {filteredProjects.length} de {projects.length} proyectos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 sm:p-6 neon-glow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Búsqueda */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
              🔍 Buscar
            </label>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              placeholder="Nombre o descripción..."
              className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle touch-manipulation"
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
              <span className="text-sm font-medium text-gray-300">Solo vencidos</span>
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
        <div className="text-center py-8 sm:py-12">
          <div className="bg-gray-800 rounded-lg p-6 sm:p-8 border border-gray-700">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">
              {projects.length === 0 ? 'No hay proyectos' : 'No se encontraron proyectos'}
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-6 px-2">
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white neon-text">Dashboard</h1>
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
      <HomeContent />
    </Suspense>
  );
}