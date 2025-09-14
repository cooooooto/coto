import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService as DatabaseService } from '@/lib/database-service';

// Forzar renderizado dinámico ya que usa parámetros de búsqueda
export const dynamic = 'force-dynamic';

// GET /api/transitions/pending?userId=xxx - Get pending transitions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const transitions = await DatabaseService.getPendingTransitionsForUser(userId);
    
    return NextResponse.json(transitions);
  } catch (error) {
    console.error('Error fetching pending transitions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
