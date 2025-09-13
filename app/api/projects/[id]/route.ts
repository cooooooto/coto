// API Routes para operaciones específicas de proyecto

import { NextRequest, NextResponse } from 'next/server';
import { getDemoProject, updateDemoProject, isDemoMode } from '@/lib/demo-data';
import { DatabaseService } from '@/lib/database-service';
import { validateProjectData } from '@/lib/projects';
import { UpdateProjectData, CreateProjectData } from '@/types/project';

// GET /api/projects/[id] - Obtener un proyecto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (isDemoMode()) {
      console.log(`[API] Demo mode - GET project ${id}`);
      const project = getDemoProject(id);
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(project);
    }
    
    const project = await DatabaseService.getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
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
    
    if (isDemoMode()) {
      console.log(`[API] Demo mode - PATCH project ${id}`);
      const body = await request.json();
      
      const updatedProject = updateDemoProject(id, body);
      if (!updatedProject) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(updatedProject);
    }
    const body = await request.json() as UpdateProjectData;

    // Check if it's a simple status or phase update
    if (body.status !== undefined && Object.keys(body).length === 1) {
      const updatedProject = await DatabaseService.updateProject(id, { status: body.status });
      return NextResponse.json(updatedProject);
    }

    if (body.phase !== undefined && Object.keys(body).length === 1) {
      const updatedProject = await DatabaseService.updateProject(id, { phase: body.phase });
      return NextResponse.json(updatedProject);
    }

    // For complex updates, convert to CreateProjectData format if needed
    let updateData: Partial<CreateProjectData> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.deadline !== undefined) updateData.deadline = body.deadline.toISOString();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.phase !== undefined) updateData.phase = body.phase;
    if (body.tasks !== undefined) {
      updateData.tasks = body.tasks.map(task => ({
        name: task.name,
        completed: task.completed
      }));
    }

    // Validate data if critical fields are being updated
    if (updateData.name !== undefined || updateData.deadline !== undefined || 
        updateData.status !== undefined || updateData.phase !== undefined) {
      const existingProject = await DatabaseService.getProject(id);
      if (!existingProject) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const dataToValidate = {
        name: updateData.name ?? existingProject.name,
        deadline: updateData.deadline ?? existingProject.deadline.toISOString(),
        status: updateData.status ?? existingProject.status,
        phase: updateData.phase ?? existingProject.phase,
        tasks: updateData.tasks ?? existingProject.tasks.map(t => ({ name: t.name, completed: t.completed }))
      };
      
      const errors = validateProjectData(dataToValidate);
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }
    }

    // Update project
    const updatedProject = await DatabaseService.updateProject(id, updateData);
    return NextResponse.json(updatedProject);
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
    
    if (isDemoMode()) {
      console.log(`[API] Demo mode - DELETE project ${id}`);
      return NextResponse.json({ success: true });
    }
    
    // Check if project exists
    const existingProject = await DatabaseService.getProject(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    await DatabaseService.deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
