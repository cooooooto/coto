'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/project';

// Hook para obtener el usuario actual
// Por ahora simularemos un usuario, pero esto se puede integrar con Supabase Auth más adelante
export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular usuario actual - en una implementación real esto vendría de Supabase Auth
    const mockUser: Profile = {
      id: 'mock-user-id-123',
      email: 'usuario@ejemplo.com',
      full_name: 'Usuario Demo',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Simular una pequeña carga
    setTimeout(() => {
      setCurrentUser(mockUser);
      setLoading(false);
    }, 100);
  }, []);

  return {
    currentUser,
    loading,
    isAuthenticated: !!currentUser
  };
}

// Hook para verificar permisos específicos
export function usePermissions(currentUser: Profile | null) {
  const canCreateProjects = () => {
    return currentUser && ['admin', 'member'].includes(currentUser.role);
  };

  const canApproveTransitions = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const canRequestTransitions = () => {
    return currentUser && ['admin', 'member'].includes(currentUser.role);
  };

  return {
    canCreateProjects,
    canApproveTransitions,
    canRequestTransitions
  };
}
