// Componente de navegación principal

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 neon-glow-subtle">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link 
            href="/" 
            className="flex items-center gap-3 text-xl font-bold text-white hover:text-green-400 transition-colors neon-text"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-lime-500 rounded-lg flex items-center justify-center neon-glow-subtle">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            Dev Project Tracker
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-green-400 ${
                isActive('/') && !isActive('/projects') 
                  ? 'text-green-400 neon-text' 
                  : 'text-gray-300'
              }`}
            >
              Inicio
            </Link>
            
            <Link
              href="/projects"
              className={`text-sm font-medium transition-colors hover:text-green-400 ${
                isActive('/projects') 
                  ? 'text-green-400 neon-text' 
                  : 'text-gray-300'
              }`}
            >
              Proyectos
            </Link>

            {/* Add Project Button */}
            <Link
              href="/projects/new"
              className="bg-green-500 hover:bg-green-400 text-black text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 neon-glow-subtle hover:neon-glow font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
