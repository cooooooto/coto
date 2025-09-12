// Componente de métricas para el dashboard con gráficos interactivos

'use client';

import { useMemo } from 'react';
import { Project } from '@/types/project';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface DashboardMetricsProps {
  projects: Project[];
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
}

function MetricCard({ title, value, subtitle, icon, trend, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 p-6 neon-glow-subtle hover:neon-glow transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`w-3 h-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardMetrics({ projects }: DashboardMetricsProps) {
  const metrics = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    // Métricas básicas
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Done').length;
    const inProgressProjects = projects.filter(p => p.status === 'In-Progress').length;
    const overdueProjects = projects.filter(p => 
      new Date(p.deadline) < now && p.status !== 'Done'
    ).length;

    // Cálculo de tareas
    const allTasks = projects.flatMap(p => p.tasks);
    const completedTasks = allTasks.filter(t => t.completed).length;
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Progreso promedio
    const averageProgress = projects.length > 0 
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      : 0;

    // Distribución por fase
    const phaseDistribution = [
      { name: 'Desarrollo', value: projects.filter(p => p.phase === 'DEV').length, color: '#8b5cf6' },
      { name: 'Integración', value: projects.filter(p => p.phase === 'INT').length, color: '#f59e0b' },
      { name: 'Pre-Prod', value: projects.filter(p => p.phase === 'PRE').length, color: '#f97316' },
      { name: 'Producción', value: projects.filter(p => p.phase === 'PROD').length, color: '#10b981' },
    ].filter(item => item.value > 0);

    // Distribución por estado
    const statusDistribution = [
      { name: 'Por Hacer', value: projects.filter(p => p.status === 'To-Do').length, color: '#6b7280' },
      { name: 'En Progreso', value: inProgressProjects, color: '#10b981' },
      { name: 'Completado', value: completedProjects, color: '#84cc16' },
    ].filter(item => item.value > 0);

    // Proyectos por mes (últimos 6 meses)
    const projectsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subDays(now, i * 30);
      const monthProjects = projects.filter(p => {
        const createdAt = new Date(p.createdAt);
        return isAfter(createdAt, subDays(monthDate, 30)) && isBefore(createdAt, monthDate);
      });
      
      projectsByMonth.push({
        month: format(monthDate, 'MMM', { locale: es }),
        projects: monthProjects.length,
        completed: monthProjects.filter(p => p.status === 'Done').length,
      });
    }

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      overdueProjects,
      completedTasks,
      totalTasks,
      completionRate,
      averageProgress,
      phaseDistribution,
      statusDistribution,
      projectsByMonth,
    };
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center neon-glow-subtle">
        <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Sin métricas disponibles</h3>
        <p className="text-gray-300">Crea tu primer proyecto para ver las métricas del dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Proyectos"
          value={metrics.totalProjects}
          icon={<Calendar className="w-5 h-5 text-green-400" />}
          className="border-green-600"
        />
        
        <MetricCard
          title="Completados"
          value={metrics.completedProjects}
          subtitle={`${Math.round((metrics.completedProjects / metrics.totalProjects) * 100)}% del total`}
          icon={<CheckCircle className="w-5 h-5 text-lime-400" />}
          className="border-lime-600"
        />
        
        <MetricCard
          title="En Progreso"
          value={metrics.inProgressProjects}
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          className="border-yellow-600"
        />
        
        <MetricCard
          title="Vencidos"
          value={metrics.overdueProjects}
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          className={metrics.overdueProjects > 0 ? "border-red-600 bg-red-900/20" : "border-gray-600"}
        />
      </div>

      {/* Métricas de tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Progreso Promedio"
          value={`${metrics.averageProgress}%`}
          subtitle="Across all projects"
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
        />
        
        <MetricCard
          title="Tareas Completadas"
          value={`${metrics.completedTasks}/${metrics.totalTasks}`}
          subtitle={`${metrics.completionRate}% completion rate`}
          icon={<CheckCircle className="w-5 h-5 text-lime-400" />}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 neon-glow-subtle">
          <h3 className="text-lg font-semibold text-white mb-4">Distribución por Estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.statusDistribution.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {metrics.statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por Fase */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 neon-glow-subtle">
          <h3 className="text-lg font-semibold text-white mb-4">Distribución por Fase</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.phaseDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tendencia de Proyectos */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 neon-glow-subtle">
        <h3 className="text-lg font-semibold text-white mb-4">Tendencia de Proyectos (Últimos 6 meses)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.projectsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Total Proyectos"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#84cc16" 
                strokeWidth={2}
                dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
                name="Completados"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
