#!/usr/bin/env node

/**
 * Script para configurar variables de entorno para Neon
 * Uso: node scripts/setup-env.js
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

async function main() {
  log('🔧 Configuración de variables de entorno para Neon', 'bold');
  
  const envPath = '.env.local';
  
  // Verificar si ya existe
  if (fs.existsSync(envPath)) {
    const overwrite = await askQuestion('El archivo .env.local ya existe. ¿Sobrescribir? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      log('❌ Operación cancelada', 'red');
      process.exit(0);
    }
  }
  
  log('\n📋 Necesitamos configurar tu connection string de Neon:', 'blue');
  log('1. Ve a https://console.neon.tech', 'cyan');
  log('2. Selecciona tu proyecto (o crea uno nuevo)', 'cyan');
  log('3. Ve a "Connection Details"', 'cyan');
  log('4. Copia la "Connection string"', 'cyan');
  log('', 'cyan');
  
  const connectionString = await askQuestion('Connection string de Neon: ');
  
  if (!connectionString || !connectionString.includes('neon.tech')) {
    log('❌ Connection string inválida. Debe contener "neon.tech"', 'red');
    process.exit(1);
  }
  
  // Generar NEXTAUTH_SECRET
  const nextAuthSecret = crypto.randomBytes(32).toString('hex');
  
  // Crear contenido del archivo .env.local
  const envContent = `# Environment Configuration
NODE_ENV=development

# === NEON DATABASE CONFIGURATION ===
# Generated on ${new Date().toISOString()}
NEON_DATABASE_URL=${connectionString}
DATABASE_URL=${connectionString}

# NextAuth Configuration (Required for authentication with Neon)
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# Optional: OAuth Providers (uncomment and configure if needed)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# === SUPABASE BACKUP CONFIGURATION (commented out) ===
# Uncomment these if you want to switch back to Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Jira Integration (Optional)
# JIRA_HOST=your-domain.atlassian.net
# JIRA_EMAIL=your-email@example.com
# JIRA_API_TOKEN=your-jira-api-token
`;

  // Escribir el archivo
  fs.writeFileSync(envPath, envContent);
  
  log('\n✅ Archivo .env.local creado exitosamente', 'green');
  log(`✅ NEXTAUTH_SECRET generado: ${nextAuthSecret.substring(0, 16)}...`, 'green');
  log('\n📝 Próximos pasos:', 'blue');
  log('1. Ejecuta el esquema en tu base de datos Neon', 'cyan');
  log('2. Ejecuta: npm run dev', 'cyan');
  log('3. Ve a http://localhost:3000', 'cyan');
  
  log('\n💡 Para ejecutar el esquema en Neon:', 'yellow');
  log('- Ve a https://console.neon.tech', 'yellow');
  log('- Abre el SQL Editor', 'yellow');
  log('- Ejecuta: type supabase\\neon-schema.sql', 'yellow');
}

if (require.main === module) {
  main().catch(console.error);
}
