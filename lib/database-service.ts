import { Project, CreateProjectData, Task, PhaseTransition, ProjectPhase, TransitionStatus, Profile } from '@/types/project';
import { calculateProjectProgress } from './projects';
import { Database } from '@/types/database';

// Importar servicios de Neon
import { neonSql, executeQuery, withTransaction } from './neon-config';
import { Client } from 'pg';

// Tipos de error personalizados
export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

export class DatabaseConnectionError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseOperationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseOperationError';
  }
}

// Configuración del proveedor de base de datos
type DatabaseProvider = 'supabase' | 'neon';

function getDatabaseProvider(): DatabaseProvider {
  // Siempre usar Neon
  console.log('🔍 Proveedor de BD: Neon');
  return 'neon';
}

// Helpers para conversión de datos
function dbRowToProject(row: any, tasks: Task[] = []): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    deadline: new Date(row.deadline),
    status: row.status,
    phase: row.phase,
    progress: row.progress,
    requires_approval: row.requires_approval,
    current_transition_id: row.current_transition_id || undefined,
    owner_id: row.owner_id || 'unknown-owner',
    tasks,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    name: row.name,
    completed: row.completed,
    createdAt: new Date(row.created_at)
  };
}

// Implementación del servicio para Neon
class NeonDatabaseService {
  static async getProjects(): Promise<Project[]> {
    try {
      console.log('🔍 Obteniendo proyectos desde Neon...');
      
      // Obtener proyectos
      const projects = await executeQuery(`
        SELECT * FROM projects 
        ORDER BY created_at DESC
      `);

      console.log(`📋 Encontrados ${projects.length} proyectos`);

      // Obtener tareas
      const tasks = await executeQuery(`
        SELECT * FROM tasks
      `);

      console.log(`✅ Encontradas ${tasks.length} tareas`);

      // Agrupar tareas por proyecto
      const tasksByProject: Record<string, Task[]> = {};
      tasks.forEach((task: any) => {
        if (!tasksByProject[task.project_id]) {
          tasksByProject[task.project_id] = [];
        }
        tasksByProject[task.project_id].push(dbRowToTask(task));
      });

      const result = projects.map((project: any) => 
        dbRowToProject(project, tasksByProject[project.id] || [])
      );

      console.log(`✅ Procesados ${result.length} proyectos con tareas`);
      return result;

    } catch (error) {
      console.error('❌ Error obteniendo proyectos desde Neon:', error);
      throw new DatabaseConnectionError(
        'Error conectando a la base de datos Neon',
        error
      );
    }
  }

  static async getProject(id: string): Promise<Project | null> {
    try {
      const projects = await executeQuery(`
        SELECT * FROM projects WHERE id = $1
      `, [id]);

      if (projects.length === 0) {
        return null;
      }

      const project = projects[0];

      const tasks = await executeQuery(`
        SELECT * FROM tasks WHERE project_id = $1
      `, [id]);

      const projectTasks = tasks.map(dbRowToTask);
      return dbRowToProject(project, projectTasks);

    } catch (error) {
      console.error('❌ Error obteniendo proyecto desde Neon:', error);
      throw new DatabaseOperationError(`Error fetching project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async createProject(data: CreateProjectData): Promise<Project> {
    return withTransaction(async (client: Client) => {
      // Calcular progreso inicial
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

      // Insertar proyecto
      const projectResult = await client.query(`
        INSERT INTO projects (name, description, deadline, status, phase, progress)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [data.name, data.description, data.deadline, data.status, data.phase, progress]);

      const project = projectResult.rows[0];

      // Insertar tareas
      const projectTasks: Task[] = [];
      for (const task of data.tasks) {
        const taskResult = await client.query(`
          INSERT INTO tasks (project_id, name, completed)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [project.id, task.name, task.completed]);

        projectTasks.push(dbRowToTask(taskResult.rows[0]));
      }

      return dbRowToProject(project, projectTasks);
    });
  }

  static async updateProject(id: string, updates: Partial<CreateProjectData>): Promise<Project> {
    return withTransaction(async (client: Client) => {
      // Obtener proyecto actual
      const currentResult = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        throw new Error('Project not found');
      }
      
      const currentProject = currentResult.rows[0];
      let progress = currentProject.progress;

      // Si se actualizan las tareas, recalcular progreso
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

        // Eliminar tareas existentes
        await client.query('DELETE FROM tasks WHERE project_id = $1', [id]);

        // Insertar nuevas tareas
        for (const task of updates.tasks) {
          await client.query(`
            INSERT INTO tasks (project_id, name, completed)
            VALUES ($1, $2, $3)
          `, [id, task.name, task.completed]);
        }
      } else if (updates.phase) {
        const tempProject = { ...currentProject, phase: updates.phase };
        progress = calculateProjectProgress(tempProject);
      }

      // Actualizar proyecto
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updates.description);
      }
      if (updates.deadline !== undefined) {
        updateFields.push(`deadline = $${paramIndex++}`);
        updateValues.push(updates.deadline);
      }
      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updates.status);
      }
      if (updates.phase !== undefined) {
        updateFields.push(`phase = $${paramIndex++}`);
        updateValues.push(updates.phase);
      }
      
      updateFields.push(`progress = $${paramIndex++}`);
      updateValues.push(progress);
      
      updateFields.push(`updated_at = $${paramIndex++}`);
      updateValues.push(new Date());

      updateValues.push(id); // Para el WHERE

      const query = `
        UPDATE projects 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, updateValues);
      const updatedProject = result.rows[0];

      // Obtener tareas actualizadas
      const tasksResult = await client.query('SELECT * FROM tasks WHERE project_id = $1', [id]);
      const tasks = tasksResult.rows.map(dbRowToTask);

      return dbRowToProject(updatedProject, tasks);
    });
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      await executeQuery('DELETE FROM projects WHERE id = $1', [id]);
    } catch (error) {
      throw new DatabaseOperationError(`Error deleting project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async requestPhaseTransition(
    projectId: string,
    toPhase: ProjectPhase,
    requestedBy: string,
    comment?: string
  ): Promise<PhaseTransition> {
    try {
      // Verificar que no hay transición pendiente
      const existingTransitions = await executeQuery(`
        SELECT * FROM phase_transitions
        WHERE project_id = $1 AND status = 'pending'
      `, [projectId]);

      if (existingTransitions.length > 0) {
        throw new DatabaseOperationError('Ya existe una transición pendiente para este proyecto');
      }

      // Obtener fase actual del proyecto
      const projects = await executeQuery(`
        SELECT phase FROM projects WHERE id = $1
      `, [projectId]);

      if (projects.length === 0) {
        throw new DatabaseOperationError('Proyecto no encontrado');
      }

      const fromPhase = projects[0].phase;

      // Crear nueva transición
      const transitions = await executeQuery(`
        INSERT INTO phase_transitions (project_id, from_phase, to_phase, status, requested_by, comment)
        VALUES ($1, $2, $3, 'pending', $4, $5)
        RETURNING *
      `, [projectId, fromPhase, toPhase, requestedBy, comment]);

      return transitions[0];
    } catch (error) {
      throw new DatabaseOperationError(`Error requesting phase transition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getProjectTransitionHistory(projectId: string): Promise<PhaseTransition[]> {
    try {
      const transitions = await executeQuery(`
        SELECT * FROM phase_transitions
        WHERE project_id = $1
        ORDER BY created_at DESC
      `, [projectId]);

      return transitions;
    } catch (error) {
      throw new DatabaseOperationError(`Error getting transition history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async reviewPhaseTransition(
    transitionId: string,
    approved: boolean,
    reviewedBy: string,
    comment?: string
  ): Promise<PhaseTransition> {
    try {
      const status = approved ? 'approved' : 'rejected';

      const transitions = await executeQuery(`
        UPDATE phase_transitions
        SET status = $1, approved_by = $2, reviewed_at = NOW(), comment = $3
        WHERE id = $4
        RETURNING *
      `, [status, reviewedBy, comment, transitionId]);

      if (transitions.length === 0) {
        throw new DatabaseOperationError('Transición no encontrada');
      }

      // Si fue aprobada, actualizar la fase del proyecto
      if (approved) {
        const transition = transitions[0];
        await executeQuery(`
          UPDATE projects
          SET phase = $1, updated_at = NOW()
          WHERE id = $2
        `, [transition.to_phase, transition.project_id]);
      }

      return transitions[0];
    } catch (error) {
      throw new DatabaseOperationError(`Error reviewing phase transition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPendingTransitionsForUser(userId: string): Promise<PhaseTransition[]> {
    try {
      const transitions = await executeQuery(`
        SELECT pt.*, p.name as project_name
        FROM phase_transitions pt
        JOIN projects p ON pt.project_id = p.id
        WHERE pt.status = 'pending'
        AND (p.owner_id = $1 OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = $1
        ))
        ORDER BY pt.created_at DESC
      `, [userId]);

      return transitions;
    } catch (error) {
      throw new DatabaseOperationError(`Error getting pending transitions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Servicio principal que usa el proveedor configurado
export class DatabaseService {
  private static getProvider(): DatabaseProvider {
    return getDatabaseProvider();
  }

  static async getProjects(): Promise<Project[]> {
    console.log('📊 Usando Neon como proveedor de BD');
    return NeonDatabaseService.getProjects();
  }

  static async getProject(id: string): Promise<Project | null> {
    return NeonDatabaseService.getProject(id);
  }

  static async createProject(data: CreateProjectData): Promise<Project> {
    return NeonDatabaseService.createProject(data);
  }

  static async updateProject(id: string, updates: Partial<CreateProjectData>): Promise<Project> {
    return NeonDatabaseService.updateProject(id, updates);
  }

  static async deleteProject(id: string): Promise<void> {
    return NeonDatabaseService.deleteProject(id);
  }

  static async requestPhaseTransition(
    projectId: string,
    toPhase: ProjectPhase,
    requestedBy: string,
    comment?: string
  ): Promise<PhaseTransition> {
    // Solo usar Neon
    return NeonDatabaseService.requestPhaseTransition(projectId, toPhase, requestedBy, comment);
  }

  static async getProjectTransitionHistory(projectId: string): Promise<PhaseTransition[]> {
    // Solo usar Neon
    return NeonDatabaseService.getProjectTransitionHistory(projectId);
  }

  static async reviewPhaseTransition(
    transitionId: string,
    approved: boolean,
    reviewedBy: string,
    comment?: string
  ): Promise<PhaseTransition> {
    // Solo usar Neon
    return NeonDatabaseService.reviewPhaseTransition(transitionId, approved, reviewedBy, comment);
  }

  static async getPendingTransitionsForUser(userId: string): Promise<PhaseTransition[]> {
    // Solo usar Neon
    return NeonDatabaseService.getPendingTransitionsForUser(userId);
  }

  // Métodos de utilidad
  static getProviderInfo() {
    const { getNeonEnvironmentInfo } = require('./neon-config');
    return {
      provider: 'neon',
      ...getNeonEnvironmentInfo()
    };
  }

  // Método para forzar un proveedor específico (solo Neon soportado)
  static forceProvider(provider: DatabaseProvider) {
    if (provider !== 'neon') {
      console.warn('⚠️ Solo Neon está soportado. Ignorando cambio de proveedor.');
      return;
    }
    process.env.FORCE_DATABASE_PROVIDER = provider;
  }
}

// Para compatibilidad hacia atrás, exportar como SupabaseService también
// Nota: SupabaseService ya está definido en supabase-service.ts
// export const SupabaseService = DatabaseService;
