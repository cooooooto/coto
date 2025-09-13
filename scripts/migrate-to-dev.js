#!/usr/bin/env node

/**
 * Script para migrar esquema y datos de producción a desarrollo
 * Uso: node scripts/migrate-to-dev.js [--schema-only] [--with-data]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  production: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  development: {
    url: process.env.NEXT_PUBLIC_SUPABASE_DEV_URL,
    key: process.env.SUPABASE_DEV_SERVICE_ROLE_KEY,
  }
};

// Validar configuración
function validateConfig() {
  const errors = [];
  
  if (!config.production.url) errors.push('NEXT_PUBLIC_SUPABASE_URL no configurada');
  if (!config.production.key) errors.push('SUPABASE_SERVICE_ROLE_KEY no configurada');
  if (!config.development.url) errors.push('NEXT_PUBLIC_SUPABASE_DEV_URL no configurada');
  if (!config.development.key) errors.push('SUPABASE_DEV_SERVICE_ROLE_KEY no configurada');
  
  if (errors.length > 0) {
    console.error('❌ Errores de configuración:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
}

// Crear clientes Supabase
function createClients() {
  return {
    prod: createClient(config.production.url, config.production.key),
    dev: createClient(config.development.url, config.development.key),
  };
}

// Aplicar esquema a desarrollo
async function applySchema(devClient) {
  console.log('📋 Aplicando esquema a desarrollo...');
  
  try {
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar esquema por partes para evitar errores
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await devClient.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️  Advertencia ejecutando SQL: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Esquema aplicado exitosamente');
  } catch (error) {
    console.error('❌ Error aplicando esquema:', error.message);
    throw error;
  }
}

// Migrar datos anonimizados
async function migrateData(prodClient, devClient) {
  console.log('📦 Migrando datos anonimizados...');
  
  try {
    // Obtener proyectos (sin datos sensibles)
    const { data: projects, error: projectsError } = await prodClient
      .from('projects')
      .select('id, name, description, deadline, status, phase, progress, created_at')
      .limit(5); // Solo algunos proyectos para desarrollo
    
    if (projectsError) throw projectsError;
    
    // Limpiar datos existentes en desarrollo
    await devClient.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await devClient.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insertar proyectos anonimizados
    if (projects && projects.length > 0) {
      const anonProjects = projects.map((project, index) => ({
        ...project,
        name: `Proyecto Dev ${index + 1}`,
        description: `Descripción anonimizada del proyecto ${index + 1}`,
        owner_id: '00000000-0000-0000-0000-000000000001', // Usuario de prueba
      }));
      
      const { error: insertError } = await devClient
        .from('projects')
        .insert(anonProjects);
      
      if (insertError) throw insertError;
      console.log(`✅ ${anonProjects.length} proyectos migrados`);
    }
    
    // Migrar estructura de tareas (sin contenido sensible)
    const { data: tasks, error: tasksError } = await prodClient
      .from('tasks')
      .select('project_id, completed')
      .in('project_id', projects?.map(p => p.id) || []);
    
    if (tasks && tasks.length > 0) {
      const anonTasks = tasks.map((task, index) => ({
        project_id: task.project_id,
        name: `Tarea de desarrollo ${index + 1}`,
        completed: task.completed,
        assigned_to: '00000000-0000-0000-0000-000000000001',
      }));
      
      const { error: tasksInsertError } = await devClient
        .from('tasks')
        .insert(anonTasks);
      
      if (tasksInsertError) throw tasksInsertError;
      console.log(`✅ ${anonTasks.length} tareas migradas`);
    }
    
  } catch (error) {
    console.error('❌ Error migrando datos:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const schemaOnly = args.includes('--schema-only');
  const withData = args.includes('--with-data');
  
  console.log('🚀 Iniciando migración a desarrollo...');
  console.log(`📊 Modo: ${schemaOnly ? 'Solo esquema' : withData ? 'Esquema y datos' : 'Esquema + datos de prueba'}`);
  
  try {
    validateConfig();
    const { prod, dev } = createClients();
    
    // Verificar conexiones
    console.log('🔍 Verificando conexiones...');
    const [prodHealth, devHealth] = await Promise.all([
      prod.from('profiles').select('count', { count: 'exact', head: true }),
      dev.from('profiles').select('count', { count: 'exact', head: true }),
    ]);
    
    if (prodHealth.error) throw new Error(`Error conectando a producción: ${prodHealth.error.message}`);
    if (devHealth.error) throw new Error(`Error conectando a desarrollo: ${devHealth.error.message}`);
    
    console.log('✅ Conexiones verificadas');
    
    // Aplicar esquema
    await applySchema(dev);
    
    // Migrar datos si se solicita
    if (withData) {
      await migrateData(prod, dev);
    } else if (!schemaOnly) {
      console.log('📝 Aplicando datos de prueba...');
      const seedPath = path.join(__dirname, 'setup-dev-db.sql');
      const seedData = fs.readFileSync(seedPath, 'utf8');
      
      // Ejecutar datos de prueba
      const statements = seedData.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await dev.rpc('exec_sql', { sql: statement + ';' });
          if (error && !error.message.includes('duplicate key')) {
            console.warn(`⚠️  Advertencia con datos de prueba: ${error.message}`);
          }
        }
      }
      console.log('✅ Datos de prueba aplicados');
    }
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('💥 Error en la migración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, validateConfig, createClients };
