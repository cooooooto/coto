// Componente de barra de progreso reutilizable

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  progress, 
  size = 'md', 
  showPercentage = true,
  className = '' 
}: ProgressBarProps) {
  // Asegurar que el progreso esté entre 0 y 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Configuraciones de tamaño
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  // Color basado en el progreso
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500 neon-glow-subtle';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden ${sizeClasses[size]} border border-gray-300 dark:border-gray-700`}>
        <div
          className={`${sizeClasses[size]} ${getProgressColor(normalizedProgress)} transition-all duration-300 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
          {Math.round(normalizedProgress)}%
        </span>
      )}
    </div>
  );
}
