// Hook para actualizaciones de proyectos (sin realtime - usando polling)
// Nota: Neon no tiene realtime built-in como Supabase, por lo que usamos polling

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';

interface UseRealtimeProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  isConnected: boolean; // Siempre true para polling
}

export function useRealtimeProjects(): UseRealtimeProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true); // Siempre true para polling

  // Función para cargar proyectos
  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/projects');

      if (!response.ok) {
        // Don't show error for configuration issues in development
        if (response.status === 500 && process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Projects API not available. Configure Neon to enable data persistence.');
          setProjects([]);
          return;
        }
        throw new Error('Error al cargar proyectos');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      // In development, just log the error instead of showing it to the user
      if (process.env.NODE_ENV === 'development') {
        console.warn('Projects API error:', errorMessage);
        setProjects([]);
        setError(null);
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función pública para refrescar
  const refreshProjects = useCallback(async () => {
    setLoading(true);
    await fetchProjects();
  }, [fetchProjects]);

  // Configurar polling para actualizaciones periódicas
  useEffect(() => {
    // Cargar datos iniciales
    fetchProjects();

    // Configurar polling cada 30 segundos para simular "realtime"
    const intervalId = setInterval(() => {
      console.log('🔄 Polling projects for updates...');
      fetchProjects();
    }, 30000); // 30 segundos

    // Cleanup
    return () => {
      clearInterval(intervalId);
      console.log('🧹 Cleaning up polling interval');
    };
  }, [fetchProjects]);

  // Nota: Con polling, no necesitamos manejar cambios individuales
  // Los cambios se detectan automáticamente en cada polling cycle

  return {
    projects,
    loading,
    error,
    refreshProjects,
    isConnected,
  };
}
