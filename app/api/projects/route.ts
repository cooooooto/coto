// API Routes para CRUD de proyectos

import { NextRequest, NextResponse } from 'next/server';
import { demoProjects, isDemoMode } from '@/lib/demo-data';
import { 
  SupabaseService, 
  SupabaseConfigError, 
  SupabaseNetworkError, 
  SupabaseDataError 
} from '@/lib/supabase-service';
import { validateProjectData } from '@/lib/projects';
import { CreateProjectData } from '@/types/project';

// Enhanced error logging for API routes
function logAPIError(endpoint: string, error: unknown, additionalInfo?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] API ${endpoint} ERROR:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    type: error?.constructor?.name,
    stack: error instanceof Error ? error.stack : undefined,
    additionalInfo
  });
}

// GET /api/projects - Obtener todos los proyectos
export async function GET() {
  try {
    console.log('[API] GET /api/projects - Starting request');
    const startTime = Date.now();
    
    if (isDemoMode()) {
      console.log('[API] ✅ Running in DEMO mode - returning offline data');
      const duration = Date.now() - startTime;
      console.log(`[API] GET /api/projects - Demo success in ${duration}ms, returned ${demoProjects.length} projects`);
      return NextResponse.json(demoProjects);
    }
    
    console.log('[API] Running in PRODUCTION mode - connecting to Supabase');
    const projects = await SupabaseService.getProjects();
    
    const duration = Date.now() - startTime;
    console.log(`[API] GET /api/projects - Success in ${duration}ms, returned ${projects.length} projects`);
    
    return NextResponse.json(projects);
    
  } catch (error) {
    logAPIError('GET /api/projects', error);
    
    // Handle specific error types with appropriate responses
    if (error instanceof SupabaseConfigError) {
      return NextResponse.json(
        { 
          error: 'Configuration Error',
          details: error.message,
          help: 'Please check your Supabase environment variables. See SUPABASE_SETUP.md for instructions.',
          type: 'config'
        },
        { status: 500 }
      );
    }
    
    if (error instanceof SupabaseNetworkError) {
      return NextResponse.json(
        { 
          error: 'Database Connection Failed',
          details: error.message,
          help: 'This might be due to network issues or incorrect Supabase URL/keys.',
          type: 'network'
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    if (error instanceof SupabaseDataError) {
      return NextResponse.json(
        { 
          error: 'Database Query Failed',
          details: error.message,
          help: 'There was an issue with the database query. Check if tables exist.',
          type: 'data'
        },
        { status: 500 }
      );
    }
    
    // Handle legacy fetch failed errors (fallback)
    if (error instanceof Error && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { 
          error: 'Database Connection Failed',
          details: 'Unable to connect to Supabase. Please check your configuration.',
          help: 'Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
          type: 'legacy_fetch'
        },
        { status: 503 }
      );
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'unknown'
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Crear un nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateProjectData;
    
    // Validar datos
    const errors = validateProjectData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Crear proyecto usando Supabase
    const project = await SupabaseService.createProject(body);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
