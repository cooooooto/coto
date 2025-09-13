import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService as DatabaseService } from '@/lib/database-service';
import { ProjectPhase } from '@/types/project';

// POST /api/projects/[id]/transitions - Request phase transition
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { toPhase, comment, requestedBy } = body;
    
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (isDemoMode) {
      console.log('[API] Demo mode - Phase transition request simulated');
      // Return mock transition data
      const mockTransition = {
        id: 'demo-transition-1',
        project_id: projectId,
        from_phase: 'DEV',
        to_phase: toPhase,
        status: 'pending',
        requested_by: requestedBy,
        comment: comment || 'Solicitud de transición en modo demo',
        requested_at: new Date(),
        created_at: new Date(),
        requester: {
          id: requestedBy,
          full_name: 'Usuario Demo',
          email: 'usuario@ejemplo.com'
        }
      };
      
      return NextResponse.json(mockTransition);
    }

    // Validate required fields
    if (!toPhase || !requestedBy) {
      return NextResponse.json(
        { error: 'toPhase and requestedBy are required' },
        { status: 400 }
      );
    }

    // Validate phase
    const validPhases: ProjectPhase[] = ['DEV', 'INT', 'PRE', 'PROD'];
    if (!validPhases.includes(toPhase)) {
      return NextResponse.json(
        { error: 'Invalid phase' },
        { status: 400 }
      );
    }

    const transition = await DatabaseService.requestPhaseTransition(
      projectId,
      toPhase,
      requestedBy,
      comment
    );

    return NextResponse.json(transition);
  } catch (error) {
    console.error('Error requesting phase transition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/transitions - Get transition history for project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    const transitions = await DatabaseService.getProjectTransitionHistory(projectId);
    
    return NextResponse.json(transitions);
  } catch (error) {
    console.error('Error fetching transition history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
