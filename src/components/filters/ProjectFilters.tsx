import { Project } from '@/types/project';
import Link from 'next/link';
import DashboardMetrics from '@/components/DashboardMetrics';

interface ProjectFiltersProps {
  filters: {
    status?: Project['status'];
    phase?: Project['phase'];
    overdue?: boolean;
    search?: string;
  };
  showFilters: boolean;
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
  onUpdateFilters: (filters: Partial<{
    status?: Project['status'];
    phase?: Project['phase'];
    overdue?: boolean;
    search?: string;
  }>) => void;
  onClearFilters: () => void;
  showMetrics?: boolean;
  projects?: Project[];
  onMetricClick?: (metricType: string) => void;
  activeFilters?: {
    status?: Project['status'];
    overdue?: boolean;
  };
}

export default function ProjectFilters({
  filters,
  showFilters,
  hasActiveFilters,
  onToggleFilters,
  onUpdateFilters,
  onClearFilters,
  showMetrics = false,
  projects = [],
  onMetricClick,
  activeFilters
}: ProjectFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Layout horizontal: Nuevo Proyecto | Estadísticas | Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Nuevo Proyecto Button - Izquierda */}
        <div className="flex-shrink-0">
          <Link
            href="/projects/new"
            className="bg-green-400 hover:bg-green-500 text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proyecto
          </Link>
        </div>

        {/* Estadísticas - Centro */}
        <div className="flex-1 flex justify-center min-w-0">
          {showMetrics && projects.length > 0 && (
            <DashboardMetrics
              projects={projects}
              onMetricClick={onMetricClick}
              activeFilters={activeFilters}
              showInFilters={true}
            />
          )}
        </div>

        {/* Botón de Filtros - Derecha */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <button
            onClick={onToggleFilters}
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
                    onClick={() => onUpdateFilters({ search: undefined })}
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
                    onClick={() => onUpdateFilters({ status: undefined })}
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
                    onClick={() => onUpdateFilters({ phase: undefined })}
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
                    onClick={() => onUpdateFilters({ overdue: undefined })}
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
            onClick={onClearFilters}
            className="text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Panel de filtros desplegable */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onUpdateFilters({ search: e.target.value || undefined })}
              placeholder="Buscar proyectos..."
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-green-500 focus:border-green-500"
            />

            <select
              value={filters.status || ''}
              onChange={(e) => onUpdateFilters({ status: e.target.value as Project['status'] || undefined })}
              className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los estados</option>
              <option value="To-Do">To-Do</option>
              <option value="In-Progress">En Progreso</option>
              <option value="Done">Completado</option>
            </select>

            <select
              value={filters.phase || ''}
              onChange={(e) => onUpdateFilters({ phase: e.target.value as Project['phase'] || undefined })}
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
                onChange={(e) => onUpdateFilters({ overdue: e.target.checked || undefined })}
                className="rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Vencidos</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
