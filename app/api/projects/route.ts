// API Routes para CRUD de proyectos

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';
import { validateProjectData } from '@/lib/projects';
import { CreateProjectData } from '@/types/project';

// GET /api/projects - Obtener todos los proyectos
export async function GET() {
  try {
    const projects = await SupabaseService.getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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
