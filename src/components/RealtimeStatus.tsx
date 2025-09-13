// Componente para mostrar el estado de conexión en tiempo real

'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface RealtimeStatusProps {
  isConnected: boolean;
  error?: string | null;
  className?: string;
}

export default function RealtimeStatus({ isConnected, error, className = '' }: RealtimeStatusProps) {
  const [showStatus, setShowStatus] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState<boolean[]>([]);

  // Mostrar estado cuando cambia la conexión
  useEffect(() => {
    setShowStatus(true);
    
    // Actualizar historial de conexión
    setConnectionHistory(prev => [...prev.slice(-4), isConnected]);
    
    const timer = setTimeout(() => {
      if (isConnected && !error) {
        setShowStatus(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isConnected, error]);

  // Mantener visible si hay error
  useEffect(() => {
    if (error) {
      setShowStatus(true);
    }
  }, [error]);

  if (!showStatus && isConnected && !error) {
    return null;
  }

  const getStatusIcon = () => {
    if (error) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    
    if (!isConnected) {
      return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (error) {
      return 'Error de conexión';
    }
    
    if (!isConnected) {
      return 'Conectando...';
    }
    
    return 'Conectado';
  };

  const getStatusColor = () => {
    if (error) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300';
    }
    
    if (!isConnected) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300';
    }
    
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300';
  };

  return (
    <div className={`fixed top-20 right-4 z-40 transition-all duration-300 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium shadow-lg ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        
        {/* Indicador de conexión con puntos */}
        {!error && (
          <div className="flex items-center gap-1 ml-2">
            {connectionHistory.slice(-3).map((connected, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  connected 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Tooltip con información adicional */}
      {error && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            Detalles del error:
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <p className="text-gray-500 dark:text-gray-500 mt-2">
            Las actualizaciones automáticas están temporalmente deshabilitadas. 
            Puedes refrescar manualmente la página.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente más simple para mostrar solo el icono
export function RealtimeStatusIcon({ isConnected, error }: { isConnected: boolean; error?: string | null }) {
  if (error) {
    return (
      <div className="flex items-center gap-1 text-red-500" title={`Error: ${error}`}>
        <WifiOff className="w-4 h-4" />
        <span className="text-xs">Error</span>
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div className="flex items-center gap-1 text-yellow-500" title="Conectando...">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Conectando</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-green-500" title="Conectado - Actualizaciones en tiempo real activas">
      <Wifi className="w-4 h-4" />
      <span className="text-xs">En vivo</span>
    </div>
  );
}
