// Botón flotante para acciones rápidas en móvil

'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FloatingActionButtonProps {
  href: string;
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

export default function FloatingActionButton({ 
  href, 
  icon, 
  label, 
  className = '' 
}: FloatingActionButtonProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {isVisible && (
        <Link
          href={href}
          className={`
            fixed bottom-6 right-6 z-50
            bg-green-500 hover:bg-green-400 
            text-black font-bold
            w-14 h-14 sm:w-16 sm:h-16
            rounded-full
            flex items-center justify-center
            shadow-lg hover:shadow-xl
            transition-all duration-300
            neon-glow-subtle hover:neon-glow
            touch-manipulation
            md:hidden
            ${className}
          `}
          aria-label={label}
          title={label}
        >
          {icon || (
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </Link>
      )}
    </>
  );
}

// Variante expandible con múltiples opciones
interface ExpandableFloatingActionButtonProps {
  actions: Array<{
    href: string;
    icon: React.ReactNode;
    label: string;
    color?: string;
  }>;
  mainIcon?: React.ReactNode;
  mainLabel?: string;
}

export function ExpandableFloatingActionButton({
  actions,
  mainIcon,
  mainLabel = "Acciones"
}: ExpandableFloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Action buttons */}
      <div className={`flex flex-col-reverse gap-3 transition-all duration-300 ${
        isExpanded ? 'mb-4' : 'mb-0'
      }`}>
        {actions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setIsExpanded(false)}
            className={`
              w-12 h-12 rounded-full
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              transition-all duration-300
              touch-manipulation
              ${action.color || 'bg-gray-700 hover:bg-gray-600 text-white'}
              ${isExpanded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
              }
            `}
            style={{
              transitionDelay: isExpanded ? `${index * 50}ms` : `${(actions.length - index - 1) * 50}ms`
            }}
            aria-label={action.label}
            title={action.label}
          >
            {action.icon}
          </Link>
        ))}
      </div>

      {/* Main button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 rounded-full
          bg-green-500 hover:bg-green-400 text-black
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-all duration-300
          neon-glow-subtle hover:neon-glow
          touch-manipulation
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
        aria-label={mainLabel}
        title={mainLabel}
      >
        {mainIcon || (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </div>
  );
}
