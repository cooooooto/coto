// Componente de formulario reutilizable para crear/editar proyectos

'use client';

import { useState } from 'react';
import { Project, ProjectStatus, ProjectPhase, CreateProjectData } from '@/types/project';
import { generateId } from '@/lib/projects';
import { useNotifications } from './RealtimeNotifications';

interface ProjectFormProps {
  project?: Project; // Para edición
  initialData?: CreateProjectData | null; // Para templates
  onSubmit: (data: CreateProjectData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

interface TaskInput {
  id: string;
  name: string;
  completed: boolean;
}

export default function ProjectForm({ project, initialData, onSubmit, onCancel, isSubmitting = false }: ProjectFormProps) {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: project?.name || initialData?.name || '',
    description: project?.description || initialData?.description || '',
    deadline: project?.deadline
      ? new Date(project.deadline).toISOString().split('T')[0]
      : initialData?.deadline
        ? new Date(initialData.deadline).toISOString().split('T')[0]
        : '',
    status: project?.status || initialData?.status || 'To-Do' as ProjectStatus,
    phase: project?.phase || initialData?.phase || 'DEV' as ProjectPhase
  });

  const [tasks, setTasks] = useState<TaskInput[]>(
    project?.tasks.map(task => ({
      id: task.id,
      name: task.name,
      completed: task.completed
    })) || 
    initialData?.tasks.map(task => ({
      id: generateId(),
      name: task.name,
      completed: task.completed
    })) || 
    [{ id: generateId(), name: '', completed: false }]
  );

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) {
      newErrors.push('El nombre del proyecto es obligatorio');
    }
    
    if (!formData.deadline) {
      newErrors.push('La fecha límite es obligatoria');
    }

    const validTasks = tasks.filter(task => task.name.trim());
    if (validTasks.length === 0) {
      newErrors.push('Debe agregar al menos una tarea');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    // Preparar datos para envío
    const submitData: CreateProjectData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      deadline: formData.deadline,
      status: formData.status,
      phase: formData.phase,
      tasks: validTasks.map(task => ({
        name: task.name.trim(),
        completed: task.completed
      }))
    };

    // Llamar a la función de envío
    onSubmit(submitData);

    // Agregar notificación después del envío exitoso
    const projectName = formData.name.trim();
    if (project) {
      // Actualización de proyecto existente
      addNotification(
        'project_updated',
        'Proyecto actualizado',
        `El proyecto "${projectName}" ha sido actualizado exitosamente`,
        projectName,
        project.id
      );
    } else {
      // Creación de nuevo proyecto
      addNotification(
        'project_created',
        'Proyecto creado',
        `El proyecto "${projectName}" ha sido creado exitosamente`,
        projectName,
        'new-project-id' // Se actualizará cuando se reciba el ID real
      );
    }
  };

  const addTask = () => {
    setTasks([...tasks, { id: generateId(), name: '', completed: false }]);
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTask = (taskId: string, updates: Partial<TaskInput>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 rounded-md p-4 neon-glow-subtle">
          <h3 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
            Por favor corrige los siguientes errores:
          </h3>
          <ul className="text-sm text-red-600 dark:text-red-300 list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Nombre del proyecto */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre del proyecto *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
          placeholder="Mi Proyecto Full-Stack"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
          placeholder="Descripción breve del proyecto..."
        />
      </div>

      {/* Fecha límite */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha límite *
        </label>
        <input
          type="date"
          id="deadline"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
          required
        />
      </div>

      {/* Estado y Fase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
          >
            <option value="To-Do">To-Do</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="phase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fase *
          </label>
          <select
            id="phase"
            value={formData.phase}
            onChange={(e) => setFormData({ ...formData, phase: e.target.value as ProjectPhase })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
          >
            <option value="DEV">Desarrollo</option>
            <option value="INT">Integración</option>
            <option value="PRE">Pre-Producción</option>
            <option value="PROD">Producción</option>
          </select>
        </div>
      </div>

      {/* Tareas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tareas *
          </label>
          <button
            type="button"
            onClick={addTask}
            className="text-sm bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-400 px-3 py-1 rounded-md transition-all duration-300 border border-green-300 dark:border-green-600 hover:neon-glow-subtle"
          >
            + Agregar tarea
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, { name: e.target.value })}
                  placeholder={`Tarea ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 focus:neon-glow-subtle"
                />
              </div>

              {project && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-500 bg-white dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Completada</span>
                </label>
              )}

              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                  title="Eliminar tarea"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hover:border-green-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-black bg-green-500 border border-transparent rounded-md hover:bg-green-400 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 neon-glow hover:neon-pulse font-bold"
        >
          {isSubmitting ? 'Guardando...' : (project ? 'Actualizar' : 'Crear')} Proyecto
        </button>
      </div>
    </form>
  );
}
