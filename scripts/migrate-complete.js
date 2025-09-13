#!/usr/bin/env node

/**
 * Script completo de migración de Supabase a Neon
 * Versión mejorada y simplificada
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

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

  // Verificar dependencias
  try {
    require('@neondatabase/serverless');
    log('✅ Dependencias de Neon instaladas', 'green');
  } catch (error) {
    log('⚠️  Instalando dependencias de Neon...', 'yellow');
    try {
      const { execSync } = require('child_process');
      execSync('npm install', { stdio: 'inherit' });
      log('✅ Dependencias instaladas', 'green');
    } catch (installError) {
      log('❌ Error instalando dependencias', 'red');
      process.exit(1);
    }
  }
}

async function showMigrationIntro() {
  log('\n🚀 Migración Completa: Supabase → Neon', 'bold');
  log('', '');
  log('Esta migración incluye:', 'cyan');
  log('• ✅ Configuración de variables de entorno', 'green');
  log('• ✅ Código ya actualizado para usar Neon', 'green');
  log('• ✅ Esquema de BD adaptado para Neon', 'green');
  log('• ✅ Dependencias instaladas', 'green');
  log('', '');
  log('Lo que necesitas hacer:', 'yellow');
  log('• 🔗 Proporcionar connection string de Neon', 'yellow');
  log('• 📊 Ejecutar esquema en tu base de datos Neon', 'yellow');
  log('• 🧪 Probar la aplicación', 'yellow');
}

async function getNeonConnectionString() {
  log('\n🔗 Configuración de Neon Database', 'blue');
  log('', '');
  log('📋 Pasos para obtener tu connection string:', 'cyan');
  log('1. Ve a https://console.neon.tech', 'cyan');
  log('2. Crea un proyecto nuevo o selecciona uno existente', 'cyan');
  log('3. Ve a "Connection Details" o "Dashboard"', 'cyan');
  log('4. Copia la "Connection string" completa', 'cyan');
  log('', '');
  log('Formato esperado:', 'yellow');
  log('postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require', 'yellow');
  log('', '');
  
  const connectionString = await askQuestion('🔗 Pega tu connection string de Neon: ');
  
  if (!connectionString || !connectionString.includes('neon.tech')) {
    log('❌ Connection string inválida. Debe contener "neon.tech"', 'red');
    log('💡 Asegúrate de copiar la connection string completa desde Neon', 'yellow');
    process.exit(1);
  }

  return connectionString;
}

async function createEnvironmentFile(connectionString) {
  log('\n📝 Configurando variables de entorno...', 'blue');
  
  const envPath = '.env.local';
  
  // Verificar si ya existe
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    if (content.includes('NEON_DATABASE_URL')) {
      const overwrite = await askQuestion('Ya existe configuración de Neon. ¿Actualizar? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        log('⏭️  Usando configuración existente', 'yellow');
        return;
      }
    }
  }
  
  // Generar NEXTAUTH_SECRET
  const nextAuthSecret = crypto.randomBytes(32).toString('hex');
  
  // Leer configuración existente si existe
  let existingContent = '';
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Comentar variables de Supabase existentes
  existingContent = existingContent.replace(
    /^(NEXT_PUBLIC_SUPABASE_URL=)/gm, '# BACKUP - $1'
  ).replace(
    /^(NEXT_PUBLIC_SUPABASE_ANON_KEY=)/gm, '# BACKUP - $1'
  ).replace(
    /^(SUPABASE_SERVICE_ROLE_KEY=)/gm, '# BACKUP - $1'
  );
  
  // Agregar configuración de Neon
  const neonConfig = `
# === NEON DATABASE CONFIGURATION ===
# Generated on ${new Date().toISOString()}
NEON_DATABASE_URL=${connectionString}
DATABASE_URL=${connectionString}

# NextAuth Configuration (Required for authentication)
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# Optional: OAuth Providers (uncomment and configure if needed)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

`;

  // Crear contenido final
  let finalContent = existingContent;
  if (!existingContent.includes('NEON_DATABASE_URL')) {
    finalContent = existingContent + neonConfig;
  } else {
    // Reemplazar configuración existente
    finalContent = finalContent.replace(
      /NEON_DATABASE_URL=.*/,
      `NEON_DATABASE_URL=${connectionString}`
    ).replace(
      /^DATABASE_URL=.*/m,
      `DATABASE_URL=${connectionString}`
    );
  }
  
  fs.writeFileSync(envPath, finalContent);
  
  log('✅ Archivo .env.local configurado', 'green');
  log(`✅ NEXTAUTH_SECRET generado: ${nextAuthSecret.substring(0, 16)}...`, 'green');
}

async function testConnection(connectionString) {
  log('\n🔍 Probando conexión a Neon...', 'blue');
  
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(connectionString);
    
    // Probar conexión básica
    const result = await sql`SELECT version(), current_database(), current_user`;
    const info = result[0];
    
    log(`✅ Conexión exitosa`, 'green');
    log(`   📊 Base de datos: ${info.current_database}`, 'cyan');
    log(`   👤 Usuario: ${info.current_user}`, 'cyan');
    log(`   🐘 PostgreSQL: ${info.version.split(' ')[1]}`, 'cyan');
    
    // Verificar tablas existentes
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    log(`\n📋 Tablas encontradas: ${tables.length}`, 'cyan');
    
    if (tables.length === 0) {
      log('⚠️  Base de datos vacía - necesitas ejecutar el esquema', 'yellow');
      return false;
    } else {
      log('Tablas existentes:', 'cyan');
      tables.forEach(table => {
        log(`  • ${table.table_name}`, 'cyan');
      });
      return true;
    }
    
  } catch (error) {
    log('❌ Error de conexión:', 'red');
    log(`   ${error.message}`, 'red');
    log('\n💡 Verifica que:', 'yellow');
    log('   • La connection string sea correcta', 'yellow');
    log('   • Tu proyecto Neon esté activo', 'yellow');
    log('   • Tengas conexión a internet', 'yellow');
    return false;
  }
}

async function showSchemaInstructions() {
  log('\n📊 Configuración del esquema de base de datos', 'blue');
  log('', '');
  log('Necesitas ejecutar el esquema en tu base de datos Neon:', 'cyan');
  log('', '');
  log('🔗 Opción 1 - Consola Web (Recomendado):', 'green');
  log('1. Ve a https://console.neon.tech', 'cyan');
  log('2. Selecciona tu proyecto', 'cyan');
  log('3. Ve a "SQL Editor"', 'cyan');
  log('4. Ejecuta este comando en tu terminal para ver el esquema:', 'cyan');
  log('   type supabase\\neon-schema.sql', 'yellow');
  log('5. Copia todo el contenido y pégalo en el SQL Editor', 'cyan');
  log('6. Haz clic en "Run" para ejecutar', 'cyan');
  log('', '');
  log('📱 Opción 2 - Línea de comandos:', 'green');
  log('Si tienes psql instalado:', 'cyan');
  log('   psql "tu_connection_string" -f supabase/neon-schema.sql', 'yellow');
}

async function showCompletionSummary() {
  log('\n🎉 ¡Migración Completada!', 'green');
  log('', '');
  log('📋 Lo que se ha configurado:', 'cyan');
  log('• ✅ Variables de entorno (.env.local)', 'green');
  log('• ✅ Código actualizado para usar Neon', 'green');
  log('• ✅ Dependencias instaladas', 'green');
  log('• ✅ Esquema preparado para Neon', 'green');
  log('', '');
  log('🚀 Próximos pasos:', 'blue');
  log('1. Ejecuta el esquema en Neon (instrucciones arriba)', 'cyan');
  log('2. Ejecuta: npm run dev', 'cyan');
  log('3. Ve a http://localhost:3000', 'cyan');
  log('4. ¡Prueba tu aplicación!', 'cyan');
  log('', '');
  log('💡 Beneficios de Neon:', 'magenta');
  log('• Serverless scaling automático', 'cyan');
  log('• Branching de BD como Git', 'cyan');
  log('• Mejor rendimiento', 'cyan');
  log('• Costos optimizados', 'cyan');
  log('', '');
  log('🔄 Para revertir:', 'yellow');
  log('Descomenta las variables de Supabase en .env.local', 'yellow');
}

async function main() {
  try {
    await showMigrationIntro();
    
    const proceed = await askQuestion('\n¿Continuar con la migración? (y/N): ');
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      log('❌ Migración cancelada', 'red');
      process.exit(0);
    }
    
    await checkPrerequisites();
    
    const connectionString = await getNeonConnectionString();
    
    await createEnvironmentFile(connectionString);
    
    const hasSchema = await testConnection(connectionString);
    
    if (!hasSchema) {
      await showSchemaInstructions();
    }
    
    await showCompletionSummary();
    
  } catch (error) {
    log('\n❌ Error durante la migración:', 'red');
    log(error.message, 'red');
    log('\n🔧 Contacta soporte si el problema persiste', 'yellow');
    process.exit(1);
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
