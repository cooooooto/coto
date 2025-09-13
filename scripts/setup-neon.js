#!/usr/bin/env node

/**
 * Script para configurar Neon y migrar esquema desde Supabase
 * Uso: node scripts/setup-neon.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

async function validateNeonConnection(connectionString) {
  console.log('🔍 Validando conexión a Neon...');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const result = await client.query('SELECT version()');
    console.log(`✅ Conectado a PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Neon:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function importSchema(connectionString, schemaFile) {
  console.log(`📋 Importando esquema desde: ${schemaFile}`);
  
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Archivo de esquema no encontrado: ${schemaFile}`);
  }
  
  try {
    // Usar psql para importar el esquema
    const cmd = `psql "${connectionString}" -f "${schemaFile}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log('✅ Esquema importado exitosamente');
  } catch (error) {
    console.error('❌ Error importando esquema:', error.message);
    throw error;
  }
}

async function setupExtensions(connectionString) {
  console.log('🔧 Configurando extensiones PostgreSQL...');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Extensiones comunes para aplicaciones Next.js
    const extensions = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
      // Agregar más extensiones según necesidades
    ];
    
    for (const ext of extensions) {
      await client.query(ext);
      console.log(`✅ ${ext}`);
    }
    
  } catch (error) {
    console.error('❌ Error configurando extensiones:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function verifyTables(connectionString) {
  console.log('📊 Verificando tablas importadas...');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.table_type})`);
    });
    
    // Verificar tablas críticas
    const criticalTables = ['profiles', 'projects', 'tasks', 'project_members'];
    const existingTables = result.rows.map(row => row.table_name);
    
    const missingTables = criticalTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn('⚠️  Tablas críticas faltantes:', missingTables);
    } else {
      console.log('✅ Todas las tablas críticas están presentes');
    }
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function updateEnvFile(neonConnectionString) {
  console.log('📝 Actualizando archivo .env.local...');
  
  const envFile = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8');
  }
  
  // Agregar configuración de Neon
  const neonConfig = `
# Neon Database Configuration
NEON_DATABASE_URL=${neonConnectionString}
DATABASE_URL=${neonConnectionString}

# Backup - Configuración Supabase original
# NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || 'backup-url'}
# NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'backup-key'}
`;
  
  // Si ya existe configuración de Neon, reemplazar
  if (envContent.includes('NEON_DATABASE_URL')) {
    envContent = envContent.replace(
      /NEON_DATABASE_URL=.*/,
      `NEON_DATABASE_URL=${neonConnectionString}`
    );
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${neonConnectionString}`
    );
  } else {
    envContent += neonConfig;
  }
  
  fs.writeFileSync(envFile, envContent);
  console.log(`✅ Archivo ${envFile} actualizado`);
}

async function main() {
  console.log('🚀 Configurando Neon Database...\n');
  
  // Obtener connection string de Neon
  const neonConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!neonConnectionString) {
    console.error('❌ NEON_DATABASE_URL no encontrada en variables de entorno');
    console.log('💡 Agrega tu connection string de Neon a .env.local:');
    console.log('   NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require');
    process.exit(1);
  }
  
  try {
    // Validar conexión
    const isConnected = await validateNeonConnection(neonConnectionString);
    if (!isConnected) {
      process.exit(1);
    }
    
    // Configurar extensiones
    await setupExtensions(neonConnectionString);
    
    // Buscar archivo de esquema más reciente
    const backupDir = path.join(process.cwd(), 'backups');
    let schemaFile = path.join(process.cwd(), 'supabase', 'schema.sql'); // Usar esquema local como fallback
    
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.includes('schema') && file.endsWith('.sql'))
        .sort()
        .reverse();
      
      if (backupFiles.length > 0) {
        schemaFile = path.join(backupDir, backupFiles[0]);
        console.log(`📋 Usando backup: ${backupFiles[0]}`);
      }
    }
    
    // Importar esquema
    await importSchema(neonConnectionString, schemaFile);
    
    // Verificar importación
    await verifyTables(neonConnectionString);
    
    // Actualizar variables de entorno
    await updateEnvFile(neonConnectionString);
    
    console.log('\n🎉 ¡Configuración de Neon completada exitosamente!');
    console.log('📝 Próximos pasos:');
    console.log('   1. Actualizar código para usar Neon en lugar de Supabase');
    console.log('   2. Probar autenticación y funcionalidades');
    console.log('   3. Ejecutar tests de integración');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Verificar dependencias
try {
  execSync('psql --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ psql no encontrado. Instala PostgreSQL client tools');
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { validateNeonConnection, importSchema, setupExtensions };
