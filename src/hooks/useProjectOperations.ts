import { useState } from 'react';
import { Project } from '@/types/project';

interface Notification {
  id: string;
  type: 'project_created' | 'project_updated' | 'project_deleted' | 'task_updated' | 'task_completed';
  title: string;
  message: string;
  timestamp: Date;
  projectId?: string;
  projectName?: string;
  read: boolean;
}

interface UseProjectOperationsProps {
  addNotification: (type: Notification["type"], title: string, message: string, projectName?: string, projectId?: string) => void;
}

export function useProjectOperations({ addNotification }: UseProjectOperationsProps) {
  const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set());

  // Actualizar estado de proyecto
  const updateProjectStatus = async (projectId: string, newStatus: Project['status'], projects: Project[], setProjects: (projects: Project[]) => void) => {
    if (updatingProjects.has(projectId)) return;

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

      // Agregar notificación
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

  // Actualizar fase de proyecto
  const updateProjectPhase = async (projectId: string, newPhase: Project['phase'], projects: Project[], setProjects: (projects: Project[]) => void) => {
    if (updatingProjects.has(projectId)) return;

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

      // Agregar notificación
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

  // Eliminar proyecto
  const deleteProject = async (projectId: string, projects: Project[], setProjects: (projects: Project[]) => void) => {
    if (updatingProjects.has(projectId)) return;

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

      // Agregar notificación
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

  return {
    updatingProjects,
    updateProjectStatus,
    updateProjectPhase,
    deleteProject
  };
}
