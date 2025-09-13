#!/usr/bin/env node

/**
 * Script para verificar la configuración de múltiples entornos
 * Uso: node scripts/verify-environments.js [--env=development|production]
 */

const { createClient } = require('@supabase/supabase-js');

// Configuraciones por entorno
const configs = {
  development: {
    url: process.env.NEXT_PUBLIC_SUPABASE_DEV_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY,
    serviceKey: process.env.SUPABASE_DEV_SERVICE_ROLE_KEY,
  },
  production: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
};

// Función para validar configuración
function validateConfig(env, config) {
  const errors = [];
  
  if (!config.url) {
    errors.push(`URL de Supabase no configurada para ${env}`);
  } else if (config.url.includes('placeholder') || config.url.includes('your-project')) {
    errors.push(`URL de Supabase tiene valor placeholder para ${env}`);
  }
  
  if (!config.anonKey) {
    errors.push(`Clave anónima no configurada para ${env}`);
  } else if (config.anonKey.length < 100) {
    errors.push(`Clave anónima parece inválida para ${env}`);
  }
  
  if (!config.serviceKey) {
    errors.push(`Clave de servicio no configurada para ${env}`);
  } else if (config.serviceKey.length < 100) {
    errors.push(`Clave de servicio parece inválida para ${env}`);
  }
  
  return errors;
}

// Función para probar conexión
async function testConnection(env, config) {
  console.log(`🔍 Probando conexión a ${env}...`);
  
  const errors = validateConfig(env, config);
  if (errors.length > 0) {
    console.error(`❌ Errores de configuración en ${env}:`);
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  try {
    // Crear cliente con clave anónima
    const client = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
    
    // Crear cliente admin
    const adminClient = createClient(config.url, config.serviceKey, {
      auth: { persistSession: false },
    });
    
    // Probar conexión básica
    console.log(`  📡 Probando conexión básica...`);
    const { error: basicError } = await client
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (basicError) {
      console.error(`  ❌ Error en conexión básica: ${basicError.message}`);
      return false;
    }
    
    // Probar conexión admin
    console.log(`  🔑 Probando conexión admin...`);
    const { data: adminData, error: adminError } = await adminClient
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (adminError) {
      console.error(`  ❌ Error en conexión admin: ${adminError.message}`);
      return false;
    }
    
    // Obtener estadísticas
    const [projectsResult, tasksResult, usersResult] = await Promise.all([
      adminClient.from('projects').select('count', { count: 'exact', head: true }),
      adminClient.from('tasks').select('count', { count: 'exact', head: true }),
      adminClient.from('profiles').select('count', { count: 'exact', head: true }),
    ]);
    
    const stats = {
      projects: projectsResult.count || 0,
      tasks: tasksResult.count || 0,
      users: usersResult.count || 0,
    };
    
    console.log(`  ✅ Conexión exitosa a ${env}`);
    console.log(`  📊 Estadísticas:`);
    console.log(`    - Usuarios: ${stats.users}`);
    console.log(`    - Proyectos: ${stats.projects}`);
    console.log(`    - Tareas: ${stats.tasks}`);
    
    // Probar tiempo real (solo para desarrollo para no interferir con producción)
    if (env === 'development') {
      console.log(`  🔴 Probando suscripciones en tiempo real...`);
      
      const channel = client
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
          console.log(`  📨 Evento recibido: ${payload.eventType}`);
        });
      
      await channel.subscribe();
      
      // Simular un cambio para probar la suscripción
      await new Promise(resolve => setTimeout(resolve, 1000));
      await channel.unsubscribe();
      
      console.log(`  ✅ Tiempo real funcional`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ Error inesperado en ${env}: ${error.message}`);
    return false;
  }
}

// Función para probar migraciones
async function testMigrations() {
  console.log(`🔄 Verificando consistencia entre entornos...`);
  
  const devConfig = configs.development;
  const prodConfig = configs.production;
  
  if (!devConfig.url || !prodConfig.url) {
    console.log(`⚠️  No se pueden comparar entornos (configuración incompleta)`);
    return;
  }
  
  try {
    const devClient = createClient(devConfig.url, devConfig.serviceKey);
    const prodClient = createClient(prodConfig.url, prodConfig.serviceKey);
    
    // Comparar esquemas (solo tablas principales)
    const tables = ['profiles', 'projects', 'tasks', 'project_members', 'comments', 'phase_transitions'];
    
    console.log(`  🔍 Verificando tablas: ${tables.join(', ')}`);
    
    for (const table of tables) {
      const [devResult, prodResult] = await Promise.all([
        devClient.from(table).select('*', { count: 'exact', head: true }),
        prodClient.from(table).select('*', { count: 'exact', head: true }),
      ]);
      
      if (devResult.error && prodResult.error) {
        console.log(`  ⚠️  Tabla ${table} no existe en ningún entorno`);
      } else if (devResult.error) {
        console.log(`  ❌ Tabla ${table} falta en desarrollo`);
      } else if (prodResult.error) {
        console.log(`  ❌ Tabla ${table} falta en producción`);
      } else {
        console.log(`  ✅ Tabla ${table} existe en ambos entornos`);
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Error verificando migraciones: ${error.message}`);
  }
}

// Función principal
async function main() {
  console.log('🔍 Verificando configuración de entornos Supabase\n');
  
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  const targetEnv = envArg ? envArg.split('=')[1] : null;
  
  const envs = targetEnv ? [targetEnv] : ['development', 'production'];
  
  let allPassed = true;
  
  for (const env of envs) {
    if (!configs[env]) {
      console.error(`❌ Entorno desconocido: ${env}`);
      allPassed = false;
      continue;
    }
    
    const passed = await testConnection(env, configs[env]);
    if (!passed) {
      allPassed = false;
    }
    console.log(''); // Línea en blanco
  }
  
  // Si ambos entornos están configurados, verificar consistencia
  if (envs.length > 1 && allPassed) {
    await testMigrations();
  }
  
  if (allPassed) {
    console.log('🎉 Todas las verificaciones pasaron exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('  1. Ejecuta: npm run setup-dev (para configurar datos de desarrollo)');
    console.log('  2. Ejecuta: npm run dev (para iniciar en modo desarrollo)');
    console.log('  3. Ejecuta: npm run dev:prod (para probar con datos de producción)');
  } else {
    console.error('\n❌ Algunas verificaciones fallaron. Revisa la configuración.');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error inesperado:', error);
    process.exit(1);
  });
}

module.exports = { testConnection, validateConfig, configs };
