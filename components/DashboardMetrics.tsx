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
  return (
    <div
      className={`bg-gray-900 rounded-lg border p-4 flex items-center gap-3 transition-all duration-300 ${
        clickable ? 'cursor-pointer hover:bg-gray-800 hover:border-gray-600 hover:shadow-lg hover:shadow-green-500/20' : ''
      } ${
        isActive ? 'border-green-500 bg-green-900/20 shadow-lg shadow-green-500/30' : 'border-gray-700'
      } ${className}`}
      onClick={clickable && onClick ? onClick : undefined}
    >
      <div className={`p-2 rounded-lg ${isActive ? 'bg-green-600' : 'bg-gray-800'}`}>
        {isActive && title !== 'Total' ? <Check className="w-4 h-4 text-white" /> : icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {clickable && (
          <p className={`text-xs mt-1 opacity-70 ${isActive ? 'text-green-400' : 'text-green-400'}`}>
            {isActive ? 'Click para quitar filtro' : 'Click para filtrar'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardMetrics({ projects, onMetricClick, activeFilters }: DashboardMetricsProps) {
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
