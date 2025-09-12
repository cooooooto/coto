// Componente para mostrar badges de estado y fase

import { ProjectStatus, ProjectPhase, STATUS_COLORS, PHASE_COLORS } from '@/types/project';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

interface PhaseBadgeProps {
  phase: ProjectPhase;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]} ${className}`}>
      {status}
    </span>
  );
}

export function PhaseBadge({ phase, className = '' }: PhaseBadgeProps) {
  const phaseLabels = {
    'DEV': 'Desarrollo',
    'INT': 'Integración',
    'PRE': 'Pre-Prod',
    'PROD': 'Producción'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PHASE_COLORS[phase]} ${className}`}>
      {phaseLabels[phase]}
    </span>
  );
}
