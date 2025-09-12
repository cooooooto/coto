// Hook para actualizaciones en tiempo real de proyectos

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  isConnected: boolean;
}

export function useRealtimeProjects(): UseRealtimeProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Función para cargar proyectos
  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        // Don't show error for configuration issues in development
        if (response.status === 500 && process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Projects API not available. Configure Supabase to enable data persistence.');
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

  // Configurar suscripción en tiempo real
  useEffect(() => {
    let realtimeChannel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      try {
        // Cargar datos iniciales
        await fetchProjects();

        // Configurar canal de tiempo real para proyectos
        realtimeChannel = supabase
          .channel('projects-channel')
          .on(
            'postgres_changes',
            {
              event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'projects',
            },
            (payload) => {
              console.log('Realtime project change:', payload);
              handleProjectChange(payload);
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
            },
            (payload) => {
              console.log('Realtime task change:', payload);
              handleTaskChange(payload);
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
            setIsConnected(status === 'SUBSCRIBED');
            
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setError('Error de conexión en tiempo real');
            }
          });

        setChannel(realtimeChannel);
      } catch (err) {
        console.error('Error setting up realtime:', err);
        setError('Error configurando actualizaciones en tiempo real');
      }
    };

    setupRealtime();

    // Cleanup
    return () => {
      if (realtimeChannel) {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchProjects]);

  // Manejar cambios en proyectos
  const handleProjectChange = useCallback(async (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        // Nuevo proyecto creado
        if (newRecord) {
          // Recargar todos los proyectos para obtener las tareas asociadas
          await fetchProjects();
        }
        break;

      case 'UPDATE':
        // Proyecto actualizado
        if (newRecord) {
          setProjects(currentProjects => 
            currentProjects.map(project => {
              if (project.id === newRecord.id) {
                // Mantener las tareas existentes y actualizar solo los datos del proyecto
                return {
                  ...project,
                  name: newRecord.name,
                  description: newRecord.description,
                  deadline: new Date(newRecord.deadline),
                  status: newRecord.status,
                  phase: newRecord.phase,
                  progress: newRecord.progress,
                  owner_id: newRecord.owner_id || project.owner_id,
                  updatedAt: new Date(newRecord.updated_at),
                };
              }
              return project;
            })
          );
        }
        break;

      case 'DELETE':
        // Proyecto eliminado
        if (oldRecord) {
          setProjects(currentProjects => 
            currentProjects.filter(project => project.id !== oldRecord.id)
          );
        }
        break;

      default:
        console.log('Unknown project event type:', eventType);
    }
  }, [fetchProjects]);

  // Manejar cambios en tareas
  const handleTaskChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        // Nueva tarea creada
        if (newRecord) {
          setProjects(currentProjects => 
            currentProjects.map(project => {
              if (project.id === newRecord.project_id) {
                const newTask = {
                  id: newRecord.id,
                  name: newRecord.name,
                  completed: newRecord.completed,
                  assigned_to: newRecord.assigned_to,
                  createdAt: new Date(newRecord.created_at),
                };
                
                return {
                  ...project,
                  tasks: [...project.tasks, newTask],
                };
              }
              return project;
            })
          );
        }
        break;

      case 'UPDATE':
        // Tarea actualizada
        if (newRecord) {
          setProjects(currentProjects => 
            currentProjects.map(project => {
              if (project.id === newRecord.project_id) {
                return {
                  ...project,
                  tasks: project.tasks.map(task => {
                    if (task.id === newRecord.id) {
                      return {
                        ...task,
                        name: newRecord.name,
                        completed: newRecord.completed,
                        assigned_to: newRecord.assigned_to,
                      };
                    }
                    return task;
                  }),
                };
              }
              return project;
            })
          );
        }
        break;

      case 'DELETE':
        // Tarea eliminada
        if (oldRecord) {
          setProjects(currentProjects => 
            currentProjects.map(project => {
              if (project.id === oldRecord.project_id) {
                return {
                  ...project,
                  tasks: project.tasks.filter(task => task.id !== oldRecord.id),
                };
              }
              return project;
            })
          );
        }
        break;

      default:
        console.log('Unknown task event type:', eventType);
    }
  }, []);

  return {
    projects,
    loading,
    error,
    refreshProjects,
    isConnected,
  };
}
