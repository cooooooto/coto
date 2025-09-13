import Link from 'next/link';
import { Project } from '@/types/project';
import ProjectCard from '@/components/ProjectCard';
import FloatingActionButton from '@/components/FloatingActionButton';

interface ProjectGridProps {
  projects: Project[];
  onUpdateStatus: (projectId: string, newStatus: Project['status']) => void;
  onUpdatePhase: (projectId: string, newPhase: Project['phase']) => void;
  onDelete: (projectId: string) => void;
  updatingProjects: Set<string>;
}

export default function ProjectGrid({
  projects,
  onUpdateStatus,
  onUpdatePhase,
  onDelete,
  updatingProjects
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay proyectos
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 px-2">
            Comienza creando tu primer proyecto de desarrollo.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 neon-glow hover:neon-pulse touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear mi primer proyecto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onUpdateStatus={onUpdateStatus}
            onUpdatePhase={onUpdatePhase}
            onDelete={onDelete}
            isUpdating={updatingProjects.has(project.id)}
          />
        ))}
      </div>

      {/* Floating Action Button para móvil */}
      <FloatingActionButton
        href="/projects/new"
        label="Crear nuevo proyecto"
      />
    </>
  );
}
