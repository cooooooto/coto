// Componente de navegación principal con soporte móvil

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80 shadow-sm dark:shadow-green-400/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-green-500 dark:hover:text-green-400 transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="hidden xs:inline">Dev Project Tracker</span>
            <span className="xs:hidden">DPT</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-green-500 dark:hover:text-green-400 ${
                isActive('/') && !isActive('/projects') 
                  ? 'text-green-500 dark:text-green-400 font-semibold' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Inicio
            </Link>
            
            <Link
              href="/projects"
              className={`text-sm font-medium transition-colors hover:text-green-500 dark:hover:text-green-400 ${
                isActive('/projects') 
                  ? 'text-green-500 dark:text-green-400 font-semibold' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Proyectos
            </Link>

            <ThemeToggle />

            {/* Desktop Add Project Button */}
            <Link
              href="/projects/new"
              className="bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}>
          <div className="py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                isActive('/') && !isActive('/projects')
                  ? 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-gray-800 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              🏠 Inicio
            </Link>
            
            <Link
              href="/projects"
              className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                isActive('/projects')
                  ? 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-gray-800 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              📁 Proyectos
            </Link>

            {/* Mobile Add Project Button */}
            <Link
              href="/projects/new"
              className="block mx-4 mt-4 bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500 text-white dark:text-gray-900 text-center font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/25"
            >
              ➕ Nuevo Proyecto
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
