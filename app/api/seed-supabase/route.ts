import { NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';

export async function POST() {
  try {
    // Sample projects data
    const sampleProjects = [
      {
        name: 'E-commerce Full-Stack App',
        description: 'Plataforma de e-commerce con React/Next.js, Node.js, PostgreSQL y Stripe para pagos.',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        status: 'In-Progress' as const,
        phase: 'DEV' as const,
        tasks: [
          { name: 'Setup inicial del proyecto y estructura de carpetas', completed: true },
          { name: 'Diseño de base de datos y modelos', completed: true },
          { name: 'API REST para productos y categorías', completed: false },
          { name: 'Frontend - Lista y detalle de productos', completed: false },
          { name: 'Sistema de autenticación (JWT)', completed: false }
        ]
      },
      {
        name: 'Blog Personal con CMS',
        description: 'Blog personal con Next.js, MDX para contenido y dashboard para gestión de posts.',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'To-Do' as const,
        phase: 'DEV' as const,
        tasks: [
          { name: 'Setup de Next.js con TypeScript', completed: false },
          { name: 'Configuración de MDX y highlighting', completed: false },
          { name: 'Diseño responsive del blog', completed: false }
        ]
      },
      {
        name: 'Dashboard Analytics',
        description: 'Dashboard interactivo para visualización de datos con React, D3.js y WebSockets.',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        status: 'Done' as const,
        phase: 'PROD' as const,
        tasks: [
          { name: 'Setup del proyecto con Vite', completed: true },
          { name: 'Componentes base y routing', completed: true },
          { name: 'Integración con D3.js para gráficos', completed: true },
          { name: 'WebSockets para datos en tiempo real', completed: true }
        ]
      }
    ];

    const createdProjects = [];
    
    for (const projectData of sampleProjects) {
      const project = await SupabaseService.createProject(projectData);
      createdProjects.push(project);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdProjects.length} sample projects successfully!`,
      projects: createdProjects 
    });
  } catch (error) {
    console.error('Error creating sample projects:', error);
    return NextResponse.json(
      { error: 'Failed to create sample projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
