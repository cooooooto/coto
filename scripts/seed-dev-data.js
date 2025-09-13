#!/usr/bin/env node

/**
 * Script para poblar la base de datos de desarrollo con datos de prueba
 * Uso: node scripts/seed-dev-data.js [--reset]
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de desarrollo
const devConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_DEV_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_DEV_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Datos de prueba
const seedData = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@test.dev',
      full_name: 'Admin Test User',
      role: 'admin',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'developer@test.dev',
      full_name: 'Developer Test User',
      role: 'member',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'viewer@test.dev',
      full_name: 'Viewer Test User',
      role: 'viewer',
    },
  ],
  projects: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Sistema de Autenticación',
      description: 'Implementación del sistema de login y registro de usuarios con OAuth',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      status: 'In-Progress',
      phase: 'DEV',
      progress: 45,
      owner_id: '00000000-0000-0000-0000-000000000001',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'API de Productos',
      description: 'Desarrollo de endpoints RESTful para gestión de productos',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 días
      status: 'To-Do',
      phase: 'DEV',
      progress: 0,
      owner_id: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Dashboard Analytics',
      description: 'Panel de control con métricas y gráficos en tiempo real',
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Vencido hace 10 días
      status: 'Done',
      phase: 'PROD',
      progress: 100,
      owner_id: '00000000-0000-0000-0000-000000000001',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Integración con Jira',
      description: 'Conectar la aplicación con Jira para sincronización de tareas',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días
      status: 'In-Progress',
      phase: 'INT',
      progress: 75,
      owner_id: '00000000-0000-0000-0000-000000000002',
    },
  ],
  tasks: [
    // Tareas para Sistema de Autenticación
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      name: 'Configurar Supabase Auth',
      completed: true,
      assigned_to: '00000000-0000-0000-0000-000000000001',
    },
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      name: 'Crear formularios de login/registro',
      completed: true,
      assigned_to: '00000000-0000-0000-0000-000000000002',
    },
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      name: 'Implementar OAuth con Google',
      completed: false,
      assigned_to: '00000000-0000-0000-0000-000000000001',
    },
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      name: 'Validación de roles y permisos',
      completed: false,
      assigned_to: '00000000-0000-0000-0000-000000000002',
    },
    // Tareas para API de Productos
    {
      project_id: '22222222-2222-2222-2222-222222222222',
      name: 'Diseñar esquema de base de datos',
      completed: false,
      assigned_to: '00000000-0000-0000-0000-000000000002',
    },
    {
      project_id: '22222222-2222-2222-2222-222222222222',
      name: 'Crear endpoints CRUD',
      completed: false,
      assigned_to: '00000000-0000-0000-0000-000000000002',
    },
    // Tareas para Dashboard Analytics
    {
      project_id: '33333333-3333-3333-3333-333333333333',
      name: 'Configurar Recharts',
      completed: true,
      assigned_to: '00000000-0000-0000-0000-000000000001',
    },
    {
      project_id: '33333333-3333-3333-3333-333333333333',
      name: 'Implementar gráficos de tiempo real',
      completed: true,
      assigned_to: '00000000-0000-0000-0000-000000000001',
    },
    // Tareas para Integración con Jira
    {
      project_id: '44444444-4444-4444-4444-444444444444',
      name: 'Configurar API de Jira',
      completed: true,
      assigned_to: '00000000-0000-0000-0000-000000000002',
    },
    {
      project_id: '44444444-4444-4444-4444-444444444444',
      name: 'Sincronización bidireccional',
      completed: false,
      assigned_to: '00000000-0000-0000-0000-000000000002',
    },
  ],
  project_members: [
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      user_id: '00000000-0000-0000-0000-000000000002',
      role: 'member',
    },
    {
      project_id: '22222222-2222-2222-2222-222222222222',
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
    },
    {
      project_id: '33333333-3333-3333-3333-333333333333',
      user_id: '00000000-0000-0000-0000-000000000003',
      role: 'viewer',
    },
    {
      project_id: '44444444-4444-4444-4444-444444444444',
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
    },
  ],
  comments: [
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      user_id: '00000000-0000-0000-0000-000000000001',
      content: 'El sistema de autenticación está progresando bien. Ya tenemos la base configurada.',
    },
    {
      project_id: '11111111-1111-1111-1111-111111111111',
      user_id: '00000000-0000-0000-0000-000000000002',
      content: 'Los formularios están listos. Ahora trabajaré en la integración con OAuth.',
    },
    {
      project_id: '22222222-2222-2222-2222-222222222222',
      user_id: '00000000-0000-0000-0000-000000000002',
      content: 'Comenzando el análisis de requisitos para la API de productos.',
    },
    {
      project_id: '44444444-4444-4444-4444-444444444444',
      user_id: '00000000-0000-0000-0000-000000000002',
      content: 'La configuración inicial con Jira está completa. Probando la sincronización.',
    },
  ],
  phase_transitions: [
    {
      project_id: '44444444-4444-4444-4444-444444444444',
      from_phase: 'DEV',
      to_phase: 'INT',
      status: 'approved',
      requested_by: '00000000-0000-0000-0000-000000000002',
      approved_by: '00000000-0000-0000-0000-000000000001',
      comment: 'Funcionalidad básica completada, listo para testing de integración',
      requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      project_id: '33333333-3333-3333-3333-333333333333',
      from_phase: 'PRE',
      to_phase: 'PROD',
      status: 'approved',
      requested_by: '00000000-0000-0000-0000-000000000001',
      approved_by: '00000000-0000-0000-0000-000000000001',
      comment: 'Testing completado exitosamente, listo para producción',
      requested_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      reviewed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Función principal
async function seedDatabase(reset = false) {
  console.log('🌱 Iniciando seeding de base de datos de desarrollo...');
  
  if (!devConfig.url || !devConfig.key) {
    console.error('❌ Configuración de desarrollo no encontrada');
    console.error('Asegúrate de tener configuradas las variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_DEV_URL');
    console.error('- SUPABASE_DEV_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(devConfig.url, devConfig.key);
  
  try {
    // Verificar conexión
    const { error: connectionError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (connectionError) {
      throw new Error(`Error de conexión: ${connectionError.message}`);
    }
    
    console.log('✅ Conexión a desarrollo verificada');
    
    if (reset) {
      console.log('🧹 Limpiando datos existentes...');
      await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('phase_transitions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('project_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log('✅ Datos limpiados');
    }
    
    // Insertar datos de prueba
    console.log('📝 Insertando perfiles...');
    const { error: profilesError } = await supabase.from('profiles').upsert(seedData.profiles);
    if (profilesError) throw profilesError;
    console.log(`✅ ${seedData.profiles.length} perfiles insertados`);
    
    console.log('📝 Insertando proyectos...');
    const { error: projectsError } = await supabase.from('projects').upsert(seedData.projects);
    if (projectsError) throw projectsError;
    console.log(`✅ ${seedData.projects.length} proyectos insertados`);
    
    console.log('📝 Insertando tareas...');
    const { error: tasksError } = await supabase.from('tasks').upsert(seedData.tasks);
    if (tasksError) throw tasksError;
    console.log(`✅ ${seedData.tasks.length} tareas insertadas`);
    
    console.log('📝 Insertando miembros de proyecto...');
    const { error: membersError } = await supabase.from('project_members').upsert(seedData.project_members);
    if (membersError) throw membersError;
    console.log(`✅ ${seedData.project_members.length} miembros insertados`);
    
    console.log('📝 Insertando comentarios...');
    const { error: commentsError } = await supabase.from('comments').upsert(seedData.comments);
    if (commentsError) throw commentsError;
    console.log(`✅ ${seedData.comments.length} comentarios insertados`);
    
    console.log('📝 Insertando transiciones de fase...');
    const { error: transitionsError } = await supabase.from('phase_transitions').upsert(seedData.phase_transitions);
    if (transitionsError) throw transitionsError;
    console.log(`✅ ${seedData.phase_transitions.length} transiciones insertadas`);
    
    console.log('🎉 Seeding completado exitosamente!');
    console.log('');
    console.log('👥 Usuarios de prueba creados:');
    seedData.profiles.forEach(profile => {
      console.log(`  - ${profile.email} (${profile.role})`);
    });
    
  } catch (error) {
    console.error('💥 Error durante el seeding:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const reset = process.argv.includes('--reset');
  seedDatabase(reset);
}

module.exports = { seedDatabase, seedData };
