// Componente para mostrar notificaciones locales manuales

'use client';

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { X, Bell, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'project_created' | 'project_updated' | 'project_deleted' | 'task_updated' | 'task_completed';
  title: string;
  message: string;
  timestamp: Date;
  projectId?: string;
  projectName?: string;
  read: boolean;
}

interface RealtimeNotificationsProps {
  className?: string;
}

// Función manual para agregar notificaciones - Exportada para uso externo
export function addNotification(
  setNotifications: Dispatch<SetStateAction<Notification[]>>,
  setUnreadCount: Dispatch<SetStateAction<number>>,
  type: Notification['type'],
  title: string,
  message: string,
  projectName?: string,
  projectId: string = 'default-id'
) {
  const newNotification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    projectName,
    timestamp: new Date(),
    projectId,
    read: false,
  };

  setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // Mantener solo 10
  setUnreadCount((prev) => prev + 1);

  // Intentar disparar push notification si está permitido
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      // Verificar que estamos en un contexto seguro (HTTPS o localhost)
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        new Notification(title, {
          body: message,
          icon: '/icon.png',
          tag: 'devtracker-notification' // Evitar notificaciones duplicadas
        });
      }
    } catch (error) {
      console.warn('Error al enviar push notification:', error);
      // No bloquear el flujo; solo loguear
    }
  } else {
    console.log('Permiso para notificaciones no concedido o API no disponible; notificación solo local.');
  }
}

// Hook personalizado para manejar notificaciones
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotificationHandler = (
    type: Notification['type'],
    title: string,
    message: string,
    projectName?: string,
    projectId: string = 'default-id'
  ) => {
    addNotification(setNotifications, setUnreadCount, type, title, message, projectName, projectId);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  return {
    notifications,
    unreadCount,
    addNotification: addNotificationHandler,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}

export default function RealtimeNotifications({ className = '' }: RealtimeNotificationsProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Componente de notificaciones para móvil
  const MobileNotifications = () => {
    if (unreadCount === 0) return null;

    return (
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg animate-pulse"
          aria-label="Ver notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </button>
      </div>
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'project_updated':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'project_created':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'project_deleted':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'task_updated':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'hace un momento';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
    return `hace ${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <>
      {/* Mobile Notifications */}
      <MobileNotifications />

      <div className={`relative ${className}`}>
        {/* Bell Icon with Badge */}
        <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Actualizaciones en Tiempo Real
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  Marcar todo como leído
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                !notification.read 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  💡 Las notificaciones aparecen solo cuando realizas acciones específicas
                </p>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </>
  );
}
