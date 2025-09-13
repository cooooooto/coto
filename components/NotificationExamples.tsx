// Ejemplos de uso de addNotification en acciones del usuario

'use client';

import { useState } from 'react';
import { useNotifications } from './RealtimeNotifications';

export default function NotificationExamples() {
  const { addNotification } = useNotifications();
  const [taskName, setTaskName] = useState('');
  const [projectName, setProjectName] = useState('');

  // Ejemplo 1: Completar una tarea
  const handleCompleteTask = () => {
    if (!taskName.trim()) return;

    addNotification(
      'task_completed',
      'Tarea completada',
      `Se completó "${taskName}" exitosamente`,
      projectName || 'Proyecto Actual',
      'task-123'
    );

    setTaskName('');
    console.log('✅ Notificación agregada por completar tarea');
  };

  // Ejemplo 2: Crear un nuevo proyecto
  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    addNotification(
      'project_created',
      'Proyecto creado',
      `El proyecto "${projectName}" ha sido creado exitosamente`,
      projectName,
      'project-456'
    );

    setProjectName('');
    console.log('✅ Notificación agregada por crear proyecto');
  };

  // Ejemplo 3: Actualizar proyecto
  const handleUpdateProject = () => {
    if (!projectName.trim()) return;

    addNotification(
      'project_updated',
      'Proyecto actualizado',
      `Se actualizaron los detalles del proyecto "${projectName}"`,
      projectName,
      'project-789'
    );

    console.log('✅ Notificación agregada por actualizar proyecto');
  };

  // Ejemplo 4: Eliminar proyecto (con confirmación)
  const handleDeleteProject = () => {
    if (!projectName.trim()) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"?`)) {
      addNotification(
        'project_deleted',
        'Proyecto eliminado',
        `El proyecto "${projectName}" ha sido eliminado`,
        projectName,
        'project-101'
      );

      setProjectName('');
      console.log('✅ Notificación agregada por eliminar proyecto');
    }
  };

  // Ejemplo 5: Nueva tarea asignada
  const handleAssignTask = () => {
    if (!taskName.trim() || !projectName.trim()) return;

    addNotification(
      'task_updated',
      'Nueva tarea asignada',
      `Se agregó "${taskName}" al proyecto "${projectName}"`,
      projectName,
      'task-202'
    );

    setTaskName('');
    console.log('✅ Notificación agregada por asignar tarea');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Ejemplos de Uso de Notificaciones Manuales
      </h2>

      <div className="space-y-4">
        {/* Inputs para datos de ejemplo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la Tarea
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Setup inicial del proyecto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: E-commerce App"
            />
          </div>
        </div>

        {/* Botones de ejemplo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCompleteTask}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!taskName.trim()}
          >
            ✅ Completar Tarea
          </button>

          <button
            onClick={handleCreateProject}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!projectName.trim()}
          >
            📁 Crear Proyecto
          </button>

          <button
            onClick={handleUpdateProject}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!projectName.trim()}
          >
            ✏️ Actualizar Proyecto
          </button>

          <button
            onClick={handleDeleteProject}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!projectName.trim()}
          >
            🗑️ Eliminar Proyecto
          </button>

          <button
            onClick={handleAssignTask}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed col-span-1 md:col-span-2"
            disabled={!taskName.trim() || !projectName.trim()}
          >
            📋 Asignar Nueva Tarea
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          💡 Cómo usar en tu código:
        </h3>
        <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
{`import { useNotifications } from '@/components/RealtimeNotifications';

function MiComponente() {
  const { addNotification } = useNotifications();

  const handleAction = () => {
    addNotification(
      'task_completed',           // tipo
      'Tarea completada',         // título
      'Mensaje descriptivo',       // mensaje
      'Nombre del Proyecto',       // opcional
      'project-id'                 // opcional
    );
  };

  return <button onClick={handleAction}>Acción</button>;
}`}
        </pre>
      </div>
    </div>
  );
}
