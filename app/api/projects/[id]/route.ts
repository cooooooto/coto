// API Routes para operaciones específicas de proyecto

import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/storage';
import { calculateProjectProgress, validateProjectData } from '@/lib/projects';
import { UpdateProjectData } from '@/types/project';

// GET /api/projects/[id] - Obtener un proyecto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Recalcular progreso
    const projectWithProgress = {
      ...project,
      progress: calculateProjectProgress(project)
    };

    return NextResponse.json(projectWithProgress);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Actualizar un proyecto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateProjectData;

    // Obtener proyecto actual
    const existingProject = await getProjectById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validar datos si se están actualizando campos críticos
    if (body.name !== undefined || body.deadline !== undefined || 
        body.status !== undefined || body.phase !== undefined) {
      const dataToValidate = {
        name: body.name ?? existingProject.name,
        deadline: body.deadline ?? existingProject.deadline,
        status: body.status ?? existingProject.status,
        phase: body.phase ?? existingProject.phase
      };
      
      const errors = validateProjectData(dataToValidate);
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }
    }

    // Actualizar proyecto
    const updatedProject = await updateProject(id, body);
    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    // Recalcular progreso
    const projectWithProgress = {
      ...updatedProject,
      progress: calculateProjectProgress(updatedProject)
    };

    return NextResponse.json(projectWithProgress);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Eliminar un proyecto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteProject(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
