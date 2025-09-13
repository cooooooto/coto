#!/usr/bin/env node

/**
 * Script de migración completa de Supabase a Neon
 * 
 * Este script automatiza todo el proceso de migración:
 * 1. Backup de Supabase
 * 2. Configuración de Neon
 * 3. Migración de esquema
 * 4. Actualización de variables de entorno
 * 5. Verificación de la migración
 * 
 * Uso: node scripts/migrate-to-neon-complete.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(question) {
  const rl = createInterface();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function checkPrerequisites() {
  log('\n🔍 Verificando prerrequisitos...', 'blue');
  
  const checks = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' },
    { cmd: 'pg_dump --version', name: 'PostgreSQL client tools' }
  ];

  for (const check of checks) {
    try {
      const version = execSync(check.cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
      log(`✅ ${check.name}: ${version}`, 'green');
    } catch (error) {
      log(`❌ ${check.name} no encontrado`, 'red');
      log(`💡 Instala ${check.name} antes de continuar`, 'yellow');
      process.exit(1);
    }
  }

  // Verificar variables de entorno de Supabase
  require('dotenv').config({ path: '.env.local' });
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('❌ Variables de entorno de Supabase no encontradas', 'red');
    log('💡 Asegúrate de tener configurado .env.local con las credenciales de Supabase', 'yellow');
    process.exit(1);
  }

  log('✅ Prerrequisitos verificados', 'green');
}

async function confirmMigration() {
  log('\n⚠️  IMPORTANTE: Migración de Supabase a Neon', 'yellow');
  log('Esta operación realizará los siguientes cambios:', 'yellow');
  log('• Creará un backup de tu esquema de Supabase', 'yellow');
  log('• Configurará una nueva conexión a Neon', 'yellow');
  log('• Migrará el esquema de base de datos', 'yellow');
  log('• Actualizará el código para usar Neon', 'yellow');
  log('• Modificará las variables de entorno', 'yellow');

  const answer = await askQuestion('\n¿Deseas continuar con la migración? (y/N): ');
  
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    log('❌ Migración cancelada por el usuario', 'red');
    process.exit(0);
  }
}

async function getNeonConnectionString() {
  log('\n🔗 Configuración de Neon Database', 'blue');
  log('Necesitas proporcionar la connection string de tu proyecto Neon.', 'cyan');
  log('Formato: postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require', 'cyan');
  
  const connectionString = await askQuestion('Connection string de Neon: ');
  
  if (!connectionString || !connectionString.includes('neon.tech')) {
    log('❌ Connection string inválida', 'red');
    process.exit(1);
  }

  return connectionString;
}

async function backupSupabase() {
  log('\n💾 Realizando backup de Supabase...', 'blue');
  
  try {
    execSync('npm run backup-supabase', { stdio: 'inherit' });
    log('✅ Backup de Supabase completado', 'green');
  } catch (error) {
    log('❌ Error durante el backup de Supabase', 'red');
    log('💡 Revisa la configuración de Supabase y las credenciales', 'yellow');
    throw error;
  }
}

async function setupNeon(connectionString) {
  log('\n🚀 Configurando Neon Database...', 'blue');
  
  // Actualizar .env.local con la connection string de Neon
  const envPath = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Agregar o actualizar variables de Neon
  const neonVars = `
# Neon Database Configuration (Added by migration script)
NEON_DATABASE_URL=${connectionString}
DATABASE_URL=${connectionString}

# NextAuth Configuration (Required for authentication)
NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET || generateRandomSecret()}
NEXTAUTH_URL=${process.env.NEXTAUTH_URL || 'http://localhost:3000'}

# Optional: Google OAuth (uncomment and configure if needed)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
`;

  // Comentar variables de Supabase (mantener como backup)
  envContent = envContent.replace(
    /^(NEXT_PUBLIC_SUPABASE_URL=)/gm,
    '# BACKUP - $1'
  ).replace(
    /^(NEXT_PUBLIC_SUPABASE_ANON_KEY=)/gm,
    '# BACKUP - $1'
  ).replace(
    /^(SUPABASE_SERVICE_ROLE_KEY=)/gm,
    '# BACKUP - $1'
  );

  // Agregar configuración de Neon si no existe
  if (!envContent.includes('NEON_DATABASE_URL')) {
    envContent += neonVars;
  }

  fs.writeFileSync(envPath, envContent);
  log('✅ Variables de entorno actualizadas', 'green');

  // Ejecutar setup de Neon
  try {
    process.env.NEON_DATABASE_URL = connectionString;
    process.env.DATABASE_URL = connectionString;
    
    execSync('npm run setup-neon', { stdio: 'inherit' });
    log('✅ Neon configurado exitosamente', 'green');
  } catch (error) {
    log('❌ Error configurando Neon', 'red');
    throw error;
  }
}

async function installDependencies() {
  log('\n📦 Instalando nuevas dependencias...', 'blue');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Dependencias instaladas', 'green');
  } catch (error) {
    log('❌ Error instalando dependencias', 'red');
    throw error;
  }
}

async function verifyMigration() {
  log('\n🔍 Verificando migración...', 'blue');
  
  try {
    // Verificar conexión a Neon
    const { DatabaseService } = require('../lib/database-service');
    const info = DatabaseService.getProviderInfo();
    
    log(`✅ Proveedor de BD: ${info.provider}`, 'green');
    log(`✅ Entorno: ${info.environment}`, 'green');
    log(`✅ Host: ${info.host}`, 'green');
    
    // Intentar obtener proyectos
    log('🔍 Probando consulta de proyectos...', 'cyan');
    const projects = await DatabaseService.getProjects();
    log(`✅ Consulta exitosa: ${projects.length} proyectos encontrados`, 'green');
    
  } catch (error) {
    log('❌ Error en la verificación:', 'red');
    log(error.message, 'red');
    log('💡 Revisa la configuración de Neon y las variables de entorno', 'yellow');
    throw error;
  }
}

function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

async function showMigrationSummary() {
  log('\n🎉 ¡Migración completada exitosamente!', 'green');
  log('\n📋 Resumen de cambios realizados:', 'cyan');
  log('• ✅ Backup de Supabase creado en /backups/', 'green');
  log('• ✅ Esquema migrado a Neon', 'green');
  log('• ✅ Código actualizado para usar Neon', 'green');
  log('• ✅ Variables de entorno configuradas', 'green');
  log('• ✅ Dependencias actualizadas', 'green');
  
  log('\n🚀 Próximos pasos:', 'blue');
  log('1. Reinicia tu servidor de desarrollo:', 'cyan');
  log('   npm run dev', 'yellow');
  
  log('\n2. Configura autenticación (opcional):', 'cyan');
  log('   • Agrega NEXTAUTH_SECRET a .env.local', 'yellow');
  log('   • Configura proveedores OAuth si es necesario', 'yellow');
  
  log('\n3. Prueba la aplicación:', 'cyan');
  log('   • Verifica que los proyectos se cargan correctamente', 'yellow');
  log('   • Prueba crear, editar y eliminar proyectos', 'yellow');
  
  log('\n4. Deploy a producción:', 'cyan');
  log('   • Actualiza variables de entorno en Vercel/Netlify', 'yellow');
  log('   • Configura NEXTAUTH_URL para producción', 'yellow');
  
  log('\n💡 Beneficios de Neon:', 'magenta');
  log('• Branching de base de datos como Git', 'cyan');
  log('• Serverless scaling automático', 'cyan');
  log('• Mejor rendimiento para aplicaciones Next.js', 'cyan');
  log('• Pricing más económico para proyectos pequeños', 'cyan');
}

async function handleError(error) {
  log('\n❌ Error durante la migración:', 'red');
  log(error.message, 'red');
  
  log('\n🔧 Pasos para resolver:', 'yellow');
  log('1. Verifica que Neon esté correctamente configurado', 'yellow');
  log('2. Revisa las variables de entorno en .env.local', 'yellow');
  log('3. Asegúrate de que PostgreSQL client tools estén instalados', 'yellow');
  log('4. Verifica la conexión a internet', 'yellow');
  
  log('\n💡 Para revertir la migración:', 'cyan');
  log('1. Restaura el archivo .env.local desde backup', 'yellow');
  log('2. Ejecuta: npm install', 'yellow');
  log('3. Reinicia el servidor de desarrollo', 'yellow');
  
  process.exit(1);
}

async function main() {
  try {
    log('🚀 Iniciando migración de Supabase a Neon...', 'bold');
    
    await checkPrerequisites();
    await confirmMigration();
    
    const connectionString = await getNeonConnectionString();
    
    log('\n📋 Plan de migración:', 'blue');
    log('1. Backup de Supabase', 'cyan');
    log('2. Configuración de Neon', 'cyan');
    log('3. Migración de esquema', 'cyan');
    log('4. Instalación de dependencias', 'cyan');
    log('5. Verificación', 'cyan');
    
    const proceed = await askQuestion('\n¿Proceder con la migración? (y/N): ');
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      log('❌ Migración cancelada', 'red');
      process.exit(0);
    }
    
    await backupSupabase();
    await setupNeon(connectionString);
    await installDependencies();
    await verifyMigration();
    
    await showMigrationSummary();
    
  } catch (error) {
    await handleError(error);
  }
}

// Manejar interrupciones
process.on('SIGINT', () => {
  log('\n\n❌ Migración interrumpida por el usuario', 'red');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\n❌ Migración terminada', 'red');
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main };
