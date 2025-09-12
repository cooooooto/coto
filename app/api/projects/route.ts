// API Routes para CRUD de proyectos

import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/storage';
import { generateId, validateProjectData, calculateProjectProgress } from '@/lib/projects';
import { Project, CreateProjectData } from '@/types/project';

// GET /api/projects - Obtener todos los proyectos
export async function GET() {
  try {
    const projects = await getAllProjects();
    
    // Recalcular progreso para cada proyecto
    const projectsWithProgress = projects.map(project => ({
      ...project,
      progress: calculateProjectProgress(project)
    }));

    return NextResponse.json(projectsWithProgress);
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

    // Crear tareas con IDs y fechas
    const tasks = body.tasks.map(task => ({
      ...task,
      id: generateId(),
      createdAt: new Date()
    }));

    // Crear proyecto
    const project: Project = {
      id: generateId(),
      name: body.name.trim(),
      description: body.description?.trim(),
      tasks,
      deadline: new Date(body.deadline),
      status: body.status,
      phase: body.phase,
      progress: 0, // Se calculará después
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calcular progreso inicial
    project.progress = calculateProjectProgress(project);

    // Guardar proyecto
    const savedProject = await createProject(project);

    return NextResponse.json(savedProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
