import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Project, ProjectFilters } from '@/types/project';
import { sortProjectsByPriority } from '@/lib/projects';

export function useProjectFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estado de filtros
  const [filters, setFilters] = useState<ProjectFilters>({
    status: searchParams.get('status') as Project['status'] || undefined,
    phase: searchParams.get('phase') as Project['phase'] || undefined,
    overdue: searchParams.get('overdue') === 'true' || undefined,
    search: searchParams.get('search') || undefined
  });

  // Estado para controlar la visibilidad de los filtros
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros a los proyectos
  const applyFilters = (projects: Project[]) => {
    let filtered = [...projects];

    // Filtro automático: ocultar proyectos completados por defecto
    const hasActiveFilters = Object.values(filters).some(value =>
      value !== undefined && value !== '' && value !== false
    );

    if (!hasActiveFilters) {
      // Si no hay filtros activos, ocultar proyectos completados
      filtered = filtered.filter(project => project.status !== 'Done');
    } else {
      // Aplicar filtros activos
      if (filters.status) {
        filtered = filtered.filter(project => project.status === filters.status);
      }

      if (filters.phase) {
        filtered = filtered.filter(project => project.phase === filters.phase);
      }

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
    return sortProjectsByPriority(filtered);
  };

  // Actualizar filtros y URL
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

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== ''
  );

  return {
    filters,
    showFilters,
    setShowFilters,
    applyFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters
  };
}
