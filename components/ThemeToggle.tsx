// Componente que muestra el ícono de tema oscuro (modo oscuro fijo)

import { Moon } from 'lucide-react';

export default function ThemeToggle() {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700">
      <Moon className="w-5 h-5 text-gray-400" />
    </div>
  );
}
