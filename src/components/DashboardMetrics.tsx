// Componente minimalista de métricas para el dashboard

'use client';

import { useMemo } from 'react';
import { Project } from '@/types/project';
import { Check } from 'lucide-react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react';

interface DashboardMetricsProps {
  projects: Project[];
  onMetricClick?: (metricType: string) => void;
  activeFilters?: {
    status?: Project['status'];
    overdue?: boolean;
  };
  showInFilters?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
  isActive?: boolean;
}

function MetricCard({ title, value, subtitle, icon, className = '', onClick, clickable, isActive }: MetricCardProps) {
  const isInFilters = className.includes('filter-card');

  return (
    <div
      className={`rounded-lg border transition-all duration-300 ${
        isInFilters
          ? `p-3 flex items-center gap-3 bg-gray-800 hover:bg-gray-700 ${clickable ? 'cursor-pointer hover:border-gray-500' : ''} ${isActive ? 'border-green-500 bg-green-900/30' : 'border-gray-600'}`
          : `bg-gray-900 p-4 flex items-center gap-3 ${clickable ? 'cursor-pointer hover:bg-gray-800 hover:border-gray-600 hover:shadow-lg hover:shadow-green-500/20' : ''} ${isActive ? 'border-green-500 bg-green-900/20 shadow-lg shadow-green-500/30' : 'border-gray-700'}`
      } ${className}`}
      onClick={clickable && onClick ? onClick : undefined}
    >
      <div className={`rounded-lg ${isInFilters ? 'p-1.5' : 'p-2'} ${isActive ? 'bg-green-600' : isInFilters ? 'bg-gray-700' : 'bg-gray-800'}`}>
        {isActive && title !== 'Total' ? <Check className={`text-white ${isInFilters ? 'w-3 h-3' : 'w-4 h-4'}`} /> : (
          <div className={isInFilters ? 'w-3 h-3' : 'w-4 h-4'}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className={`${isInFilters ? 'text-lg font-bold' : 'text-2xl font-bold'} text-white`}>{value}</p>
        <p className={`text-gray-400 ${isInFilters ? 'text-xs' : 'text-xs'}`}>{title}</p>
        {subtitle && !isInFilters && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {clickable && !isInFilters && (
          <p className={`text-xs mt-1 opacity-70 ${isActive ? 'text-green-400' : 'text-green-400'}`}>
            {isActive ? 'Click para quitar filtro' : 'Click para filtrar'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardMetrics({ projects, onMetricClick, activeFilters, showInFilters = false }: DashboardMetricsProps) {
  const metrics = useMemo(() => {
    const now = new Date();

    // Métricas básicas simplificadas
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Done').length;
    const inProgressProjects = projects.filter(p => p.status === 'In-Progress').length;
    const overdueProjects = projects.filter(p =>
      new Date(p.deadline) < now && p.status !== 'Done'
    ).length;

    // Progreso promedio simple
    const averageProgress = projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      : 0;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      overdueProjects,
      averageProgress,
    };
  }, [projects]);

  if (projects.length === 0) {
    return null; // No mostrar nada si no hay proyectos
  }

  // Determinar qué métricas están activas
  const isTotalActive = !activeFilters?.status && !activeFilters?.overdue;
  const isDoneActive = activeFilters?.status === 'Done';
  const isInProgressActive = activeFilters?.status === 'In-Progress';
  const isOverdueActive = activeFilters?.overdue === true;

  if (showInFilters) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          title="Total"
          value={metrics.totalProjects}
          icon={<Calendar className="w-3 h-3 text-green-400" />}
          clickable={!!onMetricClick}
          onClick={onMetricClick ? () => onMetricClick('all') : undefined}
          isActive={isTotalActive}
          className="filter-card"
        />

        <MetricCard
          title="En Progreso"
          value={metrics.inProgressProjects}
          icon={<Clock className="w-3 h-3 text-yellow-400" />}
          clickable={!!onMetricClick}
          onClick={onMetricClick ? () => onMetricClick('in-progress') : undefined}
          isActive={isInProgressActive}
          className="filter-card"
        />

        <MetricCard
          title="Completados"
          value={metrics.completedProjects}
          icon={<CheckCircle className="w-3 h-3 text-lime-400" />}
          clickable={!!onMetricClick}
          onClick={onMetricClick ? () => onMetricClick('done') : undefined}
          isActive={isDoneActive}
          className="filter-card"
        />

        <MetricCard
          title="Vencidos"
          value={metrics.overdueProjects}
          icon={<AlertTriangle className="w-3 h-3 text-red-400" />}
          className={`filter-card ${metrics.overdueProjects > 0 ? "border-red-600 bg-red-900/20" : ""}`}
          clickable={!!onMetricClick}
          onClick={onMetricClick ? () => onMetricClick('overdue') : undefined}
          isActive={isOverdueActive}
        />
      </div>
    );
  }

  return (
    <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        title="Total"
        value={metrics.totalProjects}
        icon={<Calendar className="w-4 h-4 text-green-400" />}
        clickable={!!onMetricClick}
        onClick={onMetricClick ? () => onMetricClick('all') : undefined}
        isActive={isTotalActive}
      />

      <MetricCard
        title="En Progreso"
        value={metrics.inProgressProjects}
        icon={<Clock className="w-4 h-4 text-yellow-400" />}
        clickable={!!onMetricClick}
        onClick={onMetricClick ? () => onMetricClick('in-progress') : undefined}
        isActive={isInProgressActive}
      />

      <MetricCard
        title="Completados"
        value={metrics.completedProjects}
        icon={<CheckCircle className="w-4 h-4 text-lime-400" />}
        clickable={!!onMetricClick}
        onClick={onMetricClick ? () => onMetricClick('done') : undefined}
        isActive={isDoneActive}
      />

      <MetricCard
        title="Vencidos"
        value={metrics.overdueProjects}
        icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
        className={metrics.overdueProjects > 0 ? "border-red-600 bg-red-900/20" : ""}
        clickable={!!onMetricClick}
        onClick={onMetricClick ? () => onMetricClick('overdue') : undefined}
        isActive={isOverdueActive}
      />
    </div>
  );
}
