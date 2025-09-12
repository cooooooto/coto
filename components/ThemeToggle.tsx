// Componente para alternar entre tema claro y oscuro

'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Prevenir hydration mismatch
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (newTheme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemPreference === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
    
    // Actualizar meta theme-color para PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      metaThemeColor.setAttribute('content', isDark ? '#030712' : '#ffffff');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Claro' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Oscuro' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'Sistema' },
  ];

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
        {themes.map(({ value, icon, label }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={`
              relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
              ${theme === value 
                ? 'bg-green-500 dark:bg-green-400 text-white dark:text-gray-900 shadow-lg' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              }
            `}
            title={`Cambiar a tema ${label.toLowerCase()}`}
            aria-label={`Cambiar a tema ${label.toLowerCase()}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
