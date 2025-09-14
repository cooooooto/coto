// Hook personalizado para media queries y detección de dispositivos móviles

'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    
    // Usar la nueva API si está disponible
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback para navegadores más antiguos
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}

// Hook específico para detectar móvil
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

// Hook para detectar tableta
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

// Hook para detectar desktop
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

// Hook para detectar orientación
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

// Hook para detectar preferencia de movimiento reducido
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Hook para detectar tema oscuro del sistema
export function usePrefersDarkTheme(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// Hook combinado para información del dispositivo
export function useDeviceInfo() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const orientation = useOrientation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersDarkTheme = usePrefersDarkTheme();

  return {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    prefersReducedMotion,
    prefersDarkTheme,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
}
