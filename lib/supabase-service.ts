import { supabaseAdmin, supabaseConfigValid } from './supabase';
import { Project, CreateProjectData, Task } from '@/types/project';
import { calculateProjectProgress } from './projects';
import { Database } from '@/types/database';

// Enhanced error types for better debugging
export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

export class SupabaseNetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'SupabaseNetworkError';
  }
}

export class SupabaseDataError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseDataError';
  }
}

// Enhanced logging for debugging
function logSupabaseOperation(operation: string, details?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Supabase ${operation}:`, details || '');
}

function logSupabaseError(operation: string, error: unknown) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Supabase ${operation} ERROR:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    type: error?.constructor?.name,
    details: error
  });
}

// Validate Supabase configuration before operations
function validateConfig() {
  if (!supabaseConfigValid) {
    throw new SupabaseConfigError(
      'Supabase is not properly configured. Please check your environment variables.'
    );
  }
}

// Convert database row to Project type
function dbRowToProject(row: Database['public']['Tables']['projects']['Row'], tasks: Task[] = []): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    deadline: new Date(row.deadline),
    status: row.status,
    phase: row.phase,
    progress: row.progress,
    owner_id: row.owner_id || 'unknown-owner',
    tasks,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

// Convert database row to Task type
function dbRowToTask(row: Database['public']['Tables']['tasks']['Row']): Task {
  return {
    id: row.id,
    name: row.name,
    completed: row.completed,
    createdAt: new Date(row.created_at)
  };
}

export class SupabaseService {
  // Get all projects with their tasks
  static async getProjects(): Promise<Project[]> {
    try {
      // Validate configuration before attempting operations
      validateConfig();
      logSupabaseOperation('getProjects', 'Starting to fetch projects and tasks');

      // Fetch projects
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        logSupabaseError('getProjects - projects query', projectsError);
        
        // Check for specific error types
        if (projectsError.message?.includes('fetch failed') || 
            projectsError.message?.includes('network') ||
            projectsError.message?.includes('timeout')) {
          throw new SupabaseNetworkError(
            'Failed to connect to database. Please check your internet connection and Supabase configuration.',
            projectsError
          );
        }
        
        throw new SupabaseDataError(
          `Error fetching projects: ${projectsError.message}`, 
          projectsError.code
        );
      }

      logSupabaseOperation('getProjects', `Fetched ${projects?.length || 0} projects`);

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabaseAdmin
        .from('tasks')
        .select('*');

      if (tasksError) {
        logSupabaseError('getProjects - tasks query', tasksError);
        
        if (tasksError.message?.includes('fetch failed') || 
            tasksError.message?.includes('network') ||
            tasksError.message?.includes('timeout')) {
          throw new SupabaseNetworkError(
            'Failed to fetch project tasks. Please check your internet connection.',
            tasksError
          );
        }
        
        throw new SupabaseDataError(
          `Error fetching tasks: ${tasksError.message}`, 
          tasksError.code
        );
      }

      logSupabaseOperation('getProjects', `Fetched ${tasks?.length || 0} tasks`);

      // Group tasks by project_id
      const tasksByProject: Record<string, Task[]> = {};
      if (tasks) {
        for (const task of tasks) {
          const taskRow = task as any;
          if (!tasksByProject[taskRow.project_id]) {
            tasksByProject[taskRow.project_id] = [];
          }
          tasksByProject[taskRow.project_id].push(dbRowToTask(taskRow));
        }
      }

      const result = (projects || []).map((project: Database['public']['Tables']['projects']['Row']) => 
        dbRowToProject(project, tasksByProject[project.id] || [])
      );

      logSupabaseOperation('getProjects', `Successfully processed ${result.length} projects with tasks`);
      return result;

    } catch (error) {
      // Re-throw our custom errors
      if (error instanceof SupabaseConfigError || 
          error instanceof SupabaseNetworkError || 
          error instanceof SupabaseDataError) {
        throw error;
      }

      // Handle unexpected errors
      logSupabaseError('getProjects - unexpected error', error);
      
      if (error instanceof Error && error.message?.includes('fetch failed')) {
        throw new SupabaseNetworkError(
          'Database connection failed. This might be due to network issues or incorrect Supabase configuration.',
          error
        );
      }

      throw new SupabaseDataError(
        `Unexpected error fetching projects: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Get a single project with its tasks
  static async getProject(id: string): Promise<Project | null> {
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return null; // Project not found
      }
      throw new Error(`Error fetching project: ${projectError.message}`);
    }

    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('project_id', id);

    if (tasksError) {
      throw new Error(`Error fetching tasks: ${tasksError.message}`);
    }

    const projectTasks = (tasks || []).map(dbRowToTask);
    return dbRowToProject(project, projectTasks);
  }

  // Create a new project
  static async createProject(data: CreateProjectData): Promise<Project> {
    // Calculate initial progress
    const tempProject = {
      tasks: data.tasks.map(task => ({
        id: '',
        name: task.name,
        completed: task.completed,
        createdAt: new Date()
      })),
      phase: data.phase
    } as Project;
    
    const progress = calculateProjectProgress(tempProject);

    // Insert project
    const projectInsert: Database['public']['Tables']['projects']['Insert'] = {
      name: data.name,
      description: data.description,
      deadline: data.deadline,
      status: data.status,
      phase: data.phase,
      progress
    };

    const { data: project, error: projectError } = await (supabaseAdmin as any)
      .from('projects')
      .insert(projectInsert)
      .select()
      .single();

    if (projectError) {
      throw new Error(`Error creating project: ${projectError.message}`);
    }

    // Insert tasks
    if (data.tasks.length > 0) {
      const tasksToInsert: Database['public']['Tables']['tasks']['Insert'][] = data.tasks.map(task => ({
        project_id: (project as any).id,
        name: task.name,
        completed: task.completed
      }));

      const { data: tasks, error: tasksError } = await (supabaseAdmin as any)
        .from('tasks')
        .insert(tasksToInsert)
        .select();

      if (tasksError) {
        throw new Error(`Error creating tasks: ${tasksError.message}`);
      }

      const projectTasks = (tasks || []).map(dbRowToTask);
      return dbRowToProject(project as any, projectTasks);
    }

    return dbRowToProject(project as any, []);
  }

  // Update a project
  static async updateProject(id: string, updates: Partial<CreateProjectData>): Promise<Project> {
    // Get current project for progress calculation
    const currentProject = await this.getProject(id);
    if (!currentProject) {
      throw new Error('Project not found');
    }

    let progress = currentProject.progress;

    // If tasks are being updated, recalculate progress
    if (updates.tasks) {
      const tempProject = {
        ...currentProject,
        tasks: updates.tasks.map(task => ({
          id: '',
          name: task.name,
          completed: task.completed,
          createdAt: new Date()
        })),
        phase: updates.phase || currentProject.phase
      } as Project;
      
      progress = calculateProjectProgress(tempProject);

      // Delete existing tasks and insert new ones
      await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('project_id', id);

      if (updates.tasks.length > 0) {
        const tasksToInsert: Database['public']['Tables']['tasks']['Insert'][] = updates.tasks.map(task => ({
          project_id: id,
          name: task.name,
          completed: task.completed
        }));

        await (supabaseAdmin as any)
          .from('tasks')
          .insert(tasksToInsert);
      }
    } else if (updates.phase) {
      // Recalculate progress if only phase is updated
      const tempProject = { ...currentProject, phase: updates.phase };
      progress = calculateProjectProgress(tempProject);
    }

    // Update project
    const projectUpdates: Database['public']['Tables']['projects']['Update'] = {};
    if (updates.name !== undefined) projectUpdates.name = updates.name;
    if (updates.description !== undefined) projectUpdates.description = updates.description;
    if (updates.deadline !== undefined) projectUpdates.deadline = updates.deadline;
    if (updates.status !== undefined) projectUpdates.status = updates.status;
    if (updates.phase !== undefined) projectUpdates.phase = updates.phase;
    projectUpdates.progress = progress;

    const { data: project, error: projectError } = await (supabaseAdmin as any)
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .select()
      .single();

    if (projectError) {
      throw new Error(`Error updating project: ${projectError.message}`);
    }

    // Get updated project with tasks
    return await this.getProject(id) || dbRowToProject(project as any, []);
  }

  // Delete a project
  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  }

  // Update project status only
  static async updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
    const { data: project, error } = await (supabaseAdmin as any)
      .from('projects')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating project status: ${error.message}`);
    }

    return await this.getProject(id) || dbRowToProject(project as any, []);
  }

  // Update project phase only
  static async updateProjectPhase(id: string, phase: Project['phase']): Promise<Project> {
    // Get current project to recalculate progress
    const currentProject = await this.getProject(id);
    if (!currentProject) {
      throw new Error('Project not found');
    }

    const tempProject = { ...currentProject, phase };
    const progress = calculateProjectProgress(tempProject);

    const { data: project, error } = await (supabaseAdmin as any)
      .from('projects')
      .update({ phase, progress })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating project phase: ${error.message}`);
    }

    return await this.getProject(id) || dbRowToProject(project as any, []);
  }
}
