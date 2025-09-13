import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Tipos para la configuración de entornos
export type Environment = 'development' | 'production' | 'test';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
}

// Configuración por entorno
function getSupabaseConfig(env: Environment): SupabaseConfig {
  switch (env) {
    case 'development':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_DEV_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        serviceKey: process.env.SUPABASE_DEV_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      };
    case 'production':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      };
    case 'test':
      // Para testing, usar desarrollo o mocks
      return getSupabaseConfig('development');
    default:
      throw new Error(`Entorno no soportado: ${env}`);
  }
}

// Detectar entorno actual
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  const customEnv = process.env.SUPABASE_ENV as Environment;
  
  // Priorizar variable personalizada si existe
  if (customEnv && ['development', 'production', 'test'].includes(customEnv)) {
    return customEnv;
  }
  
  // Fallback a NODE_ENV
  switch (nodeEnv) {
    case 'production':
      return 'production';
    case 'test':
      return 'test';
    default:
      return 'development';
  }
}

// Validación de configuración
function validateConfig(config: SupabaseConfig, env: Environment): void {
  const errors: string[] = [];
  
  if (!config.url || config.url.includes('placeholder') || config.url.includes('your-project')) {
    errors.push(`URL de Supabase inválida para entorno ${env}`);
  }
  
  if (!config.anonKey || config.anonKey.includes('placeholder') || config.anonKey.length < 100) {
    errors.push(`Clave anónima de Supabase inválida para entorno ${env}`);
  }
  
  if (!config.serviceKey || config.serviceKey.includes('placeholder') || config.serviceKey.length < 100) {
    errors.push(`Clave de servicio de Supabase inválida para entorno ${env}`);
  }
  
  if (errors.length > 0) {
    console.error(`❌ Errores de configuración de Supabase (${env}):`, errors);
    if (env === 'production') {
      throw new Error(`Configuración de Supabase inválida para producción: ${errors.join(', ')}`);
    }
  }
}

// Opciones comunes del cliente Supabase
const supabaseOptions = {
  auth: {
    persistSession: typeof window !== 'undefined', // Solo persistir en el cliente
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== 'undefined',
  },
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Límite de eventos para desarrollo
    },
  },
};

// Cache de clientes por entorno
const clients: Record<Environment, {
  client?: SupabaseClient<Database>;
  adminClient?: SupabaseClient<Database>;
}> = {
  development: {},
  production: {},
  test: {},
};

// Factory para crear clientes
export function createSupabaseClient(env?: Environment): SupabaseClient<Database> {
  const environment = env || getCurrentEnvironment();
  
  if (clients[environment].client) {
    return clients[environment].client!;
  }
  
  const config = getSupabaseConfig(environment);
  validateConfig(config, environment);
  
  const client = createClient<Database>(config.url, config.anonKey, supabaseOptions);
  clients[environment].client = client;
  
  console.log(`🔗 Cliente Supabase creado para entorno: ${environment}`);
  return client;
}

// Factory para clientes administrativos
export function createSupabaseAdminClient(env?: Environment): SupabaseClient<Database> {
  const environment = env || getCurrentEnvironment();
  
  if (clients[environment].adminClient) {
    return clients[environment].adminClient!;
  }
  
  const config = getSupabaseConfig(environment);
  validateConfig(config, environment);
  
  const adminClient = createClient<Database>(config.url, config.serviceKey, {
    ...supabaseOptions,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  clients[environment].adminClient = adminClient;
  
  console.log(`🔑 Cliente admin Supabase creado para entorno: ${environment}`);
  return adminClient;
}

// Exportar instancias por defecto
export const supabase = createSupabaseClient();
export const supabaseAdmin = createSupabaseAdminClient();

// Utilidades para testing y debugging
export function getEnvironmentInfo() {
  const env = getCurrentEnvironment();
  const config = getSupabaseConfig(env);
  
  return {
    environment: env,
    url: config.url,
    hasValidKeys: !!(config.anonKey && config.serviceKey),
    urlHost: config.url ? new URL(config.url).hostname : 'unknown',
  };
}

// Función para cambiar entorno dinámicamente (útil para testing)
export function switchEnvironment(env: Environment) {
  process.env.SUPABASE_ENV = env;
  // Limpiar cache
  clients[env] = {};
  console.log(`🔄 Entorno cambiado a: ${env}`);
}
