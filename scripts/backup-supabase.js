#!/usr/bin/env node

/**
 * Script para backup del esquema de Supabase antes de migrar a Neon
 * Uso: node scripts/backup-supabase.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

function extractConnectionInfo() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('❌ Variables de entorno de Supabase no encontradas');
  }
  
  // Extraer project ID de la URL
  const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  return {
    host: `db.${projectId}.supabase.co`,
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    // La contraseña se debe introducir manualmente o usar PGPASSWORD
  };
}

function createBackupDir() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function runBackup() {
  console.log('🔄 Iniciando backup de Supabase...');
  
  const conn = extractConnectionInfo();
  const backupDir = createBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Archivos de backup
  const schemaFile = path.join(backupDir, `supabase-schema-${timestamp}.sql`);
  const dataFile = path.join(backupDir, `supabase-data-${timestamp}.sql`);
  
  console.log(`📁 Directorio de backup: ${backupDir}`);
  
  try {
    // Backup del esquema
    console.log('📋 Exportando esquema...');
    const schemaCmd = `pg_dump --host=${conn.host} --port=${conn.port} --username=${conn.username} --dbname=${conn.database} --schema-only --no-owner --no-privileges --file="${schemaFile}"`;
    
    console.log('⚠️  Se solicitará la contraseña de la base de datos de Supabase');
    console.log('💡 Consejo: Usa PGPASSWORD=tu_password node scripts/backup-supabase.js');
    
    execSync(schemaCmd, { stdio: 'inherit' });
    console.log(`✅ Esquema exportado: ${schemaFile}`);
    
    // Backup de datos (opcional, solo tablas principales)
    console.log('📊 Exportando datos...');
    const dataCmd = `pg_dump --host=${conn.host} --port=${conn.port} --username=${conn.username} --dbname=${conn.database} --data-only --table=public.profiles --table=public.projects --table=public.tasks --table=public.project_members --file="${dataFile}"`;
    
    execSync(dataCmd, { stdio: 'inherit' });
    console.log(`✅ Datos exportados: ${dataFile}`);
    
    // Crear resumen
    const summary = {
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      files: {
        schema: path.basename(schemaFile),
        data: path.basename(dataFile)
      },
      connectionInfo: {
        host: conn.host,
        database: conn.database
      }
    };
    
    fs.writeFileSync(
      path.join(backupDir, `backup-info-${timestamp}.json`),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n🎉 Backup completado exitosamente');
    console.log(`📋 Esquema: ${schemaFile}`);
    console.log(`📊 Datos: ${dataFile}`);
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error.message);
    process.exit(1);
  }
}

// Verificar dependencias
try {
  execSync('pg_dump --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ pg_dump no encontrado. Instala PostgreSQL client tools:');
  console.error('Windows: https://www.postgresql.org/download/windows/');
  console.error('macOS: brew install postgresql');
  console.error('Ubuntu: apt-get install postgresql-client');
  process.exit(1);
}

if (require.main === module) {
  runBackup();
}

module.exports = { runBackup, extractConnectionInfo };
