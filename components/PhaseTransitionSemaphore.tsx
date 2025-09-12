'use client';

import { useState } from 'react';
import { Project, ProjectPhase, PhaseTransition, Profile, TRANSITION_COLORS, PHASE_COLORS } from '@/types/project';

interface PhaseTransitionSemaphoreProps {
  project: Project;
  currentUser: Profile;
  onRequestTransition: (toPhase: ProjectPhase, comment?: string) => Promise<void>;
  onReviewTransition: (transitionId: string, approved: boolean, comment?: string) => Promise<void>;
}

export default function PhaseTransitionSemaphore({ 
  project, 
  currentUser, 
  onRequestTransition, 
  onReviewTransition 
}: PhaseTransitionSemaphoreProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRequestTransition = () => {
    return project.owner_id === currentUser.id || 
           project.members?.some(m => m.user_id === currentUser.id && ['owner', 'admin', 'member'].includes(m.role));
  };

  const canApproveTransition = () => {
    return project.owner_id === currentUser.id || 
           currentUser.role === 'admin' ||
           project.members?.some(m => m.user_id === currentUser.id && m.role === 'admin');
  };

  const getNextPhase = (): ProjectPhase | null => {
    const phases: ProjectPhase[] = ['DEV', 'INT', 'PRE', 'PROD'];
    const currentIndex = phases.indexOf(project.phase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  };

  const getSemaphoreColor = () => {
    if (project.current_transition?.status === 'pending') return 'bg-yellow-500';
    if (project.current_transition?.status === 'rejected') return 'bg-red-500';
    return 'bg-green-500';
  };

  const getPhaseLabel = (phase: ProjectPhase) => {
    const labels = {
      'DEV': 'Desarrollo',
      'INT': 'Integración', 
      'PRE': 'Pre-Prod',
      'PROD': 'Producción'
    };
    return labels[phase];
  };

  const nextPhase = getNextPhase();
  const hasPendingTransition = project.current_transition?.status === 'pending';

  const handleRequestTransition = async () => {
    if (!nextPhase) return;
    
    setIsSubmitting(true);
    try {
      await onRequestTransition(nextPhase, comment);
      setComment('');
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error requesting transition:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewTransition = async (approved: boolean) => {
    if (!project.current_transition) return;
    
    setIsSubmitting(true);
    try {
      await onReviewTransition(project.current_transition.id, approved, comment);
      setComment('');
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error reviewing transition:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Control de Fases</h3>
        {project.requires_approval && (
          <span className="text-xs bg-blue-900 text-blue-400 px-2 py-1 rounded border border-blue-600">
            Aprobación Requerida
          </span>
        )}
      </div>

      {/* Semáforo Visual */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full ${getSemaphoreColor()} ${hasPendingTransition ? 'animate-pulse' : ''} shadow-lg`}></div>
          <span className="text-xs text-gray-400 mt-1">
            {hasPendingTransition ? 'Pendiente' : 'Activo'}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${PHASE_COLORS[project.phase]}`}>
              {getPhaseLabel(project.phase)}
            </span>
            {nextPhase && (
              <>
                <span className="text-gray-500 text-lg">→</span>
                <span className={`px-3 py-1 rounded text-sm font-medium border-dashed border-2 ${PHASE_COLORS[nextPhase]} opacity-60`}>
                  {getPhaseLabel(nextPhase)}
                </span>
              </>
            )}
          </div>
          
          {hasPendingTransition && (
            <div className={`text-xs px-2 py-1 rounded ${TRANSITION_COLORS.pending}`}>
              🕐 Transición pendiente de aprobación
            </div>
          )}
        </div>
      </div>

      {/* Información de Transición Actual */}
      {project.current_transition && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-600">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-white">
              Solicitud: {project.current_transition.from_phase ? getPhaseLabel(project.current_transition.from_phase) : 'Inicial'} → {getPhaseLabel(project.current_transition.to_phase)}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${TRANSITION_COLORS[project.current_transition.status]}`}>
              {project.current_transition.status === 'pending' ? 'Pendiente' : 
               project.current_transition.status === 'approved' ? 'Aprobada' : 'Rechazada'}
            </span>
          </div>
          
          {project.current_transition.comment && (
            <div className="bg-gray-700 rounded p-2 mb-2">
              <p className="text-sm text-gray-300 italic">"{project.current_transition.comment}"</p>
            </div>
          )}
          
          <div className="text-xs text-gray-400 flex justify-between">
            <span>
              Solicitado por: <strong className="text-gray-300">{project.current_transition.requester?.full_name || 'Usuario'}</strong>
            </span>
            <span>
              {new Date(project.current_transition.requested_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {project.current_transition.approved_by && project.current_transition.reviewed_at && (
            <div className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-600">
              <span>
                {project.current_transition.status === 'approved' ? 'Aprobado' : 'Rechazado'} por: <strong className="text-gray-300">{project.current_transition.approver?.full_name || 'Usuario'}</strong>
              </span>
              <span className="ml-2">
                {new Date(project.current_transition.reviewed_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-2">
        {!hasPendingTransition && nextPhase && canRequestTransition() && project.requires_approval && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-blue-400 px-4 py-2 rounded-md text-sm transition-colors border border-blue-600 hover:neon-glow-subtle font-medium"
          >
            📤 Solicitar avance a {getPhaseLabel(nextPhase)}
          </button>
        )}

        {!hasPendingTransition && nextPhase && canRequestTransition() && !project.requires_approval && (
          <button
            onClick={() => handleRequestTransition()}
            disabled={isSubmitting}
            className="flex-1 bg-green-900 hover:bg-green-800 text-green-400 px-4 py-2 rounded-md text-sm transition-colors border border-green-600 hover:neon-glow-subtle font-medium disabled:opacity-50"
          >
            {isSubmitting ? '⏳ Procesando...' : `✅ Avanzar a ${getPhaseLabel(nextPhase)}`}
          </button>
        )}
        
        {hasPendingTransition && canApproveTransition() && project.current_transition?.requested_by !== currentUser.id && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex-1 bg-orange-900 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded-md text-sm transition-colors border border-orange-600 hover:neon-glow-subtle font-medium"
          >
            👀 Revisar Solicitud
          </button>
        )}

        {!nextPhase && (
          <div className="flex-1 text-center text-gray-400 text-sm py-2">
            🎉 Proyecto en fase final
          </div>
        )}
      </div>

      {/* Modal de Solicitud */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-white">
              Solicitar Transición a {nextPhase && getPhaseLabel(nextPhase)}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Esta solicitud será enviada para aprobación antes de realizar el cambio de fase.
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional sobre la solicitud (ej: tests completados, documentación actualizada)..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setComment('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleRequestTransition}
                disabled={isSubmitting}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-blue-400 px-4 py-2 rounded-md transition-colors border border-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Revisión */}
      {showReviewModal && project.current_transition && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-white">Revisar Transición</h3>
            
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
              <p className="text-sm text-white mb-2">
                <strong>Solicitud:</strong> {project.current_transition.from_phase ? getPhaseLabel(project.current_transition.from_phase) : 'Inicial'} → {getPhaseLabel(project.current_transition.to_phase)}
              </p>
              <p className="text-sm text-gray-300 mb-2">
                <strong>Solicitado por:</strong> {project.current_transition.requester?.full_name}
              </p>
              <p className="text-sm text-gray-400">
                <strong>Fecha:</strong> {new Date(project.current_transition.requested_at).toLocaleDateString('es-ES')}
              </p>
              {project.current_transition.comment && (
                <div className="mt-3 p-2 bg-gray-700 rounded">
                  <p className="text-sm text-gray-300">
                    <strong>Comentario:</strong> "{project.current_transition.comment}"
                  </p>
                </div>
              )}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario sobre la decisión (opcional)..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent mb-6"
              rows={3}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setComment('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReviewTransition(false)}
                disabled={isSubmitting}
                className="flex-1 bg-red-900 hover:bg-red-800 text-red-400 px-4 py-2 rounded-md transition-colors border border-red-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : '❌ Rechazar'}
              </button>
              <button
                onClick={() => handleReviewTransition(true)}
                disabled={isSubmitting}
                className="flex-1 bg-green-900 hover:bg-green-800 text-green-400 px-4 py-2 rounded-md transition-colors border border-green-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : '✅ Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
