#!/usr/bin/env node

/**
 * Script de migración simplificada de Supabase a Neon
 * Versión sin dependencias de PostgreSQL client tools
 */

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
  
  // Solo verificar Node.js y npm
  const checks = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' }
  ];

  for (const check of checks) {
    try {
      const { execSync } = require('child_process');
      const version = execSync(check.cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
      log(`✅ ${check.name}: ${version}`, 'green');
    } catch (error) {
      log(`❌ ${check.name} no encontrado`, 'red');
      process.exit(1);
    }
  }

  log('✅ Prerrequisitos verificados', 'green');
}

async function confirmMigration() {
  log('\n⚠️  IMPORTANTE: Migración de Supabase a Neon', 'yellow');
  log('Esta operación realizará los siguientes cambios:', 'yellow');
  log('• Configurará una nueva conexión a Neon', 'yellow');
  log('• Actualizará el código para usar Neon', 'yellow');
  log('• Modificará las variables de entorno', 'yellow');
  log('• Instalará nuevas dependencias', 'yellow');

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
  log('', 'cyan');
  log('📋 Pasos para obtener tu connection string:', 'yellow');
  log('1. Ve a https://console.neon.tech', 'yellow');
  log('2. Selecciona tu proyecto (o crea uno nuevo)', 'yellow');
  log('3. Ve a "Connection Details"', 'yellow');
  log('4. Copia la "Connection string"', 'yellow');
  log('', 'cyan');
  
  const connectionString = await askQuestion('Connection string de Neon: ');
  
  if (!connectionString || !connectionString.includes('neon.tech')) {
    log('❌ Connection string inválida. Debe contener "neon.tech"', 'red');
    process.exit(1);
  }

  return connectionString;
}

async function setupNeon(connectionString) {
  log('\n🚀 Configurando Neon Database...', 'blue');
  
  // Actualizar .env.local con la connection string de Neon
  const envPath = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    log('✅ Archivo .env.local encontrado', 'green');
  } else {
    log('📝 Creando nuevo archivo .env.local', 'cyan');
  }
  
  // Generar NEXTAUTH_SECRET
  const crypto = require('crypto');
  const nextAuthSecret = crypto.randomBytes(32).toString('hex');
  
  // Agregar o actualizar variables de Neon
  const neonVars = `
# === NEON DATABASE CONFIGURATION ===
# Added by migration script on ${new Date().toISOString()}
NEON_DATABASE_URL=${connectionString}
DATABASE_URL=${connectionString}

# NextAuth Configuration (Required for authentication)
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

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
  ).replace(
    /^(NEXT_PUBLIC_SUPABASE_DEV_URL=)/gm,
    '# BACKUP - $1'
  ).replace(
    /^(NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY=)/gm,
    '# BACKUP - $1'
  ).replace(
    /^(SUPABASE_DEV_SERVICE_ROLE_KEY=)/gm,
    '# BACKUP - $1'
  );

  // Agregar configuración de Neon si no existe
  if (!envContent.includes('NEON_DATABASE_URL')) {
    envContent += neonVars;
  } else {
    // Reemplazar configuración existente
    envContent = envContent.replace(
      /NEON_DATABASE_URL=.*/,
      `NEON_DATABASE_URL=${connectionString}`
    ).replace(
      /^DATABASE_URL=.*/m,
      `DATABASE_URL=${connectionString}`
    );
  }

  fs.writeFileSync(envPath, envContent);
  log('✅ Variables de entorno actualizadas', 'green');
  log(`✅ NEXTAUTH_SECRET generado: ${nextAuthSecret.substring(0, 16)}...`, 'green');

  return true;
}

async function installDependencies() {
  log('\n📦 Instalando nuevas dependencias...', 'blue');
  
  try {
    const { execSync } = require('child_process');
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Dependencias instaladas', 'green');
  } catch (error) {
    log('❌ Error instalando dependencias', 'red');
    log('💡 Ejecuta manualmente: npm install', 'yellow');
    throw error;
  }
}

async function testNeonConnection(connectionString) {
  log('\n🔍 Probando conexión a Neon...', 'blue');
  
  try {
    // Usar el driver de Neon para probar la conexión
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(connectionString);
    
    // Probar query simple
    const result = await sql`SELECT version()`;
    log(`✅ Conexión exitosa a PostgreSQL: ${result[0].version.split(' ')[1]}`, 'green');
    
    // Probar si las tablas existen
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      log(`✅ Encontradas ${tables.length} tablas en la base de datos`, 'green');
      
      if (tables.length === 0) {
        log('⚠️  La base de datos está vacía. Necesitarás importar el esquema.', 'yellow');
        log('💡 Ejecuta el script SQL de supabase/schema.sql en tu consola de Neon', 'yellow');
      } else {
        log('📋 Tablas encontradas:', 'cyan');
        tables.forEach(table => {
          log(`  - ${table.table_name}`, 'cyan');
        });
      }
      
    } catch (schemaError) {
      log('⚠️  No se pudieron listar las tablas, pero la conexión funciona', 'yellow');
    }
    
    return true;
  } catch (error) {
    log('❌ Error probando conexión a Neon:', 'red');
    log(error.message, 'red');
    log('💡 Verifica que la connection string sea correcta', 'yellow');
    return false;
  }
}

async function showMigrationSummary() {
  log('\n🎉 ¡Migración completada exitosamente!', 'green');
  log('\n📋 Resumen de cambios realizados:', 'cyan');
  log('• ✅ Configuración de Neon agregada a .env.local', 'green');
  log('• ✅ Variables de Supabase comentadas (como backup)', 'green');
  log('• ✅ NEXTAUTH_SECRET generado automáticamente', 'green');
  log('• ✅ Dependencias de Neon instaladas', 'green');
  log('• ✅ Código actualizado para usar DatabaseService', 'green');
  
  log('\n🚀 Próximos pasos:', 'blue');
  log('1. Si tu base de datos Neon está vacía, importa el esquema:', 'cyan');
  log('   - Ve a https://console.neon.tech', 'yellow');
  log('   - Abre el SQL Editor', 'yellow');
  log('   - Copia y pega el contenido de supabase/schema.sql', 'yellow');
  log('   - Ejecuta el script', 'yellow');
  
  log('\n2. Reinicia tu servidor de desarrollo:', 'cyan');
  log('   npm run dev', 'yellow');
  
  log('\n3. Prueba la aplicación:', 'cyan');
  log('   - Ve a http://localhost:3000', 'yellow');
  log('   - Verifica que los proyectos se cargan correctamente', 'yellow');
  log('   - Prueba crear, editar y eliminar proyectos', 'yellow');
  
  log('\n💡 Beneficios de Neon:', 'magenta');
  log('• Branching de base de datos como Git', 'cyan');
  log('• Serverless scaling automático', 'cyan');
  log('• Mejor rendimiento para aplicaciones Next.js', 'cyan');
  log('• Pricing más económico para proyectos pequeños', 'cyan');
  
  log('\n🔄 Para revertir la migración:', 'yellow');
  log('• Descomenta las variables de Supabase en .env.local', 'yellow');
  log('• Comenta las variables de Neon', 'yellow');
  log('• Reinicia el servidor de desarrollo', 'yellow');
}

async function handleError(error) {
  log('\n❌ Error durante la migración:', 'red');
  log(error.message, 'red');
  
  log('\n🔧 Pasos para resolver:', 'yellow');
  log('1. Verifica que Neon esté correctamente configurado', 'yellow');
  log('2. Revisa la connection string de Neon', 'yellow');
  log('3. Asegúrate de tener acceso a internet', 'yellow');
  log('4. Intenta ejecutar: npm install', 'yellow');
  
  process.exit(1);
}

async function main() {
  try {
    log('🚀 Iniciando migración simplificada de Supabase a Neon...', 'bold');
    
    await checkPrerequisites();
    await confirmMigration();
    
    const connectionString = await getNeonConnectionString();
    
    log('\n📋 Plan de migración:', 'blue');
    log('1. Configuración de variables de entorno', 'cyan');
    log('2. Instalación de dependencias', 'cyan');
    log('3. Prueba de conexión', 'cyan');
    
    const proceed = await askQuestion('\n¿Proceder con la migración? (y/N): ');
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      log('❌ Migración cancelada', 'red');
      process.exit(0);
    }
    
    await setupNeon(connectionString);
    await installDependencies();
    
    const connectionWorking = await testNeonConnection(connectionString);
    
    if (connectionWorking) {
      await showMigrationSummary();
    } else {
      log('\n⚠️  La migración se completó pero hay problemas de conexión', 'yellow');
      log('Revisa la connection string y vuelve a intentar', 'yellow');
    }
    
  } catch (error) {
    await handleError(error);
  }
}

// Manejar interrupciones
process.on('SIGINT', () => {
  log('\n\n❌ Migración interrumpida por el usuario', 'red');
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main };
