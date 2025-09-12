#!/usr/bin/env node

/**
 * Script para verificar la configuración de Supabase
 * Ejecuta: node scripts/verify-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySupabaseConfig() {
  console.log('🔍 Verificando configuración de Supabase...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const errors = [];

  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_URL is missing or using placeholder');
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL configured');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or using placeholder');
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configured');
  }

  if (!supabaseServiceKey || supabaseServiceKey === 'placeholder-service-key') {
    errors.push('❌ SUPABASE_SERVICE_ROLE_KEY is missing or using placeholder');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY configured');
  }

  if (errors.length > 0) {
    console.log('\n🚨 Configuration Errors:');
    errors.forEach(error => console.log(error));
    console.log('\n📝 Please create .env.local with your Supabase credentials');
    console.log('📖 See SUPABASE_SETUP.md for instructions');
    return false;
  }

  // Test connection
  console.log('\n🔌 Testing connection to Supabase...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to query projects table
    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      
      if (error.message.includes('relation "projects" does not exist')) {
        console.log('💡 Hint: Run the SQL schema in Supabase SQL Editor');
      } else if (error.message.includes('Invalid API key')) {
        console.log('💡 Hint: Check your SUPABASE_SERVICE_ROLE_KEY');
      } else if (error.message.includes('fetch failed')) {
        console.log('💡 Hint: Check your NEXT_PUBLIC_SUPABASE_URL');
      }
      
      return false;
    }

    console.log('✅ Successfully connected to Supabase');
    console.log(`📊 Projects table exists with ${count || 0} records`);
    
    return true;

  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}`);
    
    if (error.message.includes('fetch failed')) {
      console.log('💡 This might be a network issue or incorrect URL');
    }
    
    return false;
  }
}

// Run verification
verifySupabaseConfig()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase configuration is working correctly!');
      console.log('✨ You can now start your Next.js application');
      process.exit(0);
    } else {
      console.log('\n💥 Supabase configuration needs attention');
      console.log('🛠️  Please fix the issues above before running your app');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Verification script failed:', error.message);
    process.exit(1);
  });
