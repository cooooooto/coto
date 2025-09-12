import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';

// PATCH /api/transitions/[id] - Review phase transition
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transitionId } = await params;
    const body = await request.json();
    const { approved, reviewedBy, comment } = body;
    
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (isDemoMode) {
      console.log('[API] Demo mode - Transition review simulated');
      // Return mock reviewed transition
      const mockReviewedTransition = {
        id: transitionId,
        project_id: 'demo-project-1',
        from_phase: 'DEV',
        to_phase: 'INT',
        status: approved ? 'approved' : 'rejected',
        requested_by: 'mock-user-id-123',
        approved_by: reviewedBy,
        comment: comment || (approved ? 'Aprobado en modo demo' : 'Rechazado en modo demo'),
        requested_at: new Date(Date.now() - 60000), // 1 minute ago
        reviewed_at: new Date(),
        created_at: new Date(Date.now() - 60000),
        requester: {
          id: 'mock-user-id-123',
          full_name: 'Usuario Demo',
          email: 'usuario@ejemplo.com'
        },
        approver: {
          id: reviewedBy,
          full_name: 'Revisor Demo',
          email: 'revisor@ejemplo.com'
        }
      };
      
      return NextResponse.json(mockReviewedTransition);
    }

    // Validate required fields
    if (typeof approved !== 'boolean' || !reviewedBy) {
      return NextResponse.json(
        { error: 'approved (boolean) and reviewedBy are required' },
        { status: 400 }
      );
    }

    const transition = await SupabaseService.reviewPhaseTransition(
      transitionId,
      approved,
      reviewedBy,
      comment
    );

    return NextResponse.json(transition);
  } catch (error) {
    console.error('Error reviewing phase transition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/transitions/[id] - Get specific transition details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transitionId } = await params;
    
    // This would require a new method in SupabaseService to get a single transition
    // For now, we'll return a simple response
    return NextResponse.json({ message: 'Transition details endpoint - to be implemented' });
  } catch (error) {
    console.error('Error fetching transition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
