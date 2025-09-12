import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';

// GET /api/transitions/pending?userId=xxx - Get pending transitions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const transitions = await SupabaseService.getPendingTransitionsForUser(userId);
    
    return NextResponse.json(transitions);
  } catch (error) {
    console.error('Error fetching pending transitions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
