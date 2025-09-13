#!/usr/bin/env node

/**
 * Script temporal para verificar variables de entorno
 * Uso: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando variables de entorno...\n');

const vars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_DEV_URL',
  'NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY',
  'SUPABASE_DEV_SERVICE_ROLE_KEY'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const masked = value.length > 20 ? 
      value.substring(0, 10) + '...' + value.substring(value.length - 10) : 
      value;
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
  }
});

console.log('\n📝 Si ves valores enmascarados (con ...), significa que están configuradas correctamente.');
console.log('🚨 Si ves "NO CONFIGURADA", necesitas agregar esa variable a .env.local');
