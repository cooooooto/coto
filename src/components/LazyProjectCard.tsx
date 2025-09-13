// ProjectCard con lazy loading y optimizaciones para móvil

'use client';

import { memo, lazy, Suspense } from 'react';
import { Project } from '@/types/project';

const ProjectCard = lazy(() => import('./ProjectCard'));

interface LazyProjectCardProps {
  project: Project;
  onUpdateStatus?: (projectId: string, status: Project['status']) => Promise<void>;
  onUpdatePhase?: (projectId: string, phase: Project['phase']) => Promise<void>;
  onDelete?: (projectId: string) => Promise<void>;
  index?: number;
  isUpdating?: boolean;
}

// Skeleton component para loading
function ProjectCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 sm:p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-3 sm:mb-4">
        <div className="h-5 sm:h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Badges skeleton */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="h-6 bg-gray-700 rounded-full w-16"></div>
        <div className="h-6 bg-gray-700 rounded-full w-20"></div>
      </div>

      {/* Deadline skeleton */}
      <div className="mb-3 sm:mb-4">
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>

      {/* Tasks skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-4/5"></div>
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="mb-4">
        <div className="h-3 bg-gray-700 rounded w-full"></div>
      </div>

      {/* Actions skeleton */}
      <div className="pt-3 sm:pt-4 border-t border-gray-800">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-700 rounded-full w-16"></div>
          <div className="h-8 bg-gray-700 rounded-full w-16"></div>
          <div className="h-8 bg-gray-700 rounded-full w-14"></div>
        </div>
      </div>
    </div>
  );
}

function LazyProjectCard({ project, onUpdateStatus, onUpdatePhase, onDelete, index = 0, isUpdating = false }: LazyProjectCardProps) {
  return (
    <Suspense fallback={<ProjectCardSkeleton />}>
      <div
        style={{
          // Stagger animation delay based on index
          animationDelay: `${index * 50}ms`
        }}
        className="animate-fade-in-up"
      >
        <ProjectCard
          project={project}
          onUpdateStatus={onUpdateStatus}
          onUpdatePhase={onUpdatePhase}
          onDelete={onDelete}
          isUpdating={isUpdating}
        />
      </div>
    </Suspense>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(LazyProjectCard, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.status === nextProps.project.status &&
    prevProps.project.phase === nextProps.project.phase &&
    prevProps.project.progress === nextProps.project.progress &&
    prevProps.project.updatedAt === nextProps.project.updatedAt &&
    prevProps.project.tasks.length === nextProps.project.tasks.length &&
    prevProps.isUpdating === nextProps.isUpdating
  );
});
