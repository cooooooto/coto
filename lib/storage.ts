// Sistema de almacenamiento simple usando archivo JSON
// En producción, reemplazar con Prisma + PostgreSQL o similar

import fs from 'fs';
import path from 'path';
import { Project } from '@/types/project';

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');

// Asegurar que el directorio data existe
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Lee todos los proyectos del almacenamiento
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }

    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(data) as Project[];
    
    // Convertir strings de fecha a objetos Date
    return projects.map(project => ({
      ...project,
      deadline: new Date(project.deadline),
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
      tasks: project.tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt)
      }))
    }));
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

/**
 * Obtiene un proyecto por su ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find(project => project.id === id) || null;
}

/**
 * Guarda todos los proyectos al almacenamiento
 */
export async function saveAllProjects(projects: Project[]): Promise<void> {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving projects:', error);
    throw new Error('Failed to save projects');
  }
}

/**
 * Crea un nuevo proyecto
 */
export async function createProject(project: Project): Promise<Project> {
  const projects = await getAllProjects();
  projects.push(project);
  await saveAllProjects(projects);
  return project;
}

/**
 * Actualiza un proyecto existente
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = await getAllProjects();
  const index = projects.findIndex(project => project.id === id);
  
  if (index === -1) {
    return null;
  }

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date()
  };

  await saveAllProjects(projects);
  return projects[index];
}

/**
 * Elimina un proyecto
 */
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getAllProjects();
  const filteredProjects = projects.filter(project => project.id !== id);
  
  if (filteredProjects.length === projects.length) {
    return false; // Proyecto no encontrado
  }

  await saveAllProjects(filteredProjects);
  return true;
}
