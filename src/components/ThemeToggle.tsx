// Indicador de tema oscuro (modo oscuro fijo)
import { Moon } from 'lucide-react';

interface ThemeIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeIndicator({ size = 'md' }: ThemeIndicatorProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 ${sizeClasses[size]}`}>
      <Moon className="w-5 h-5 text-gray-400" />
    </div>
  );
}
