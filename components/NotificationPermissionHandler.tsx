// Componente para manejar permisos de notificaciones del browser

'use client';

import { useEffect } from 'react';

export default function NotificationPermissionHandler() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    // Verificar si ya tenemos permiso
    if (Notification.permission === 'granted') {
      console.log('✅ Permiso de notificaciones ya concedido');
      return;
    }

    // Si el permiso está por defecto, solicitarlo
    if (Notification.permission === 'default') {
      console.log('📢 Solicitando permiso para notificaciones...');
      Notification.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            console.log('✅ Permiso de notificaciones concedido');
          } else {
            console.log('❌ Permiso de notificaciones denegado');
          }
        })
        .catch((error) => {
          console.warn('⚠️ Error al solicitar permiso de notificaciones:', error);
        });
    } else if (Notification.permission === 'denied') {
      console.log('❌ Permiso de notificaciones denegado por el usuario');
    }
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
