import { neon } from '@neondatabase/serverless';
import { Pool, Client } from 'pg';

// Tipos para configuración
export type Environment = 'development' | 'production' | 'test';

interface NeonConfig {
  connectionString: string;
  pooled?: boolean;
}

// Configuración por entorno
function getNeonConfig(env: Environment): NeonConfig {
  switch (env) {
    case 'development':
      return {
        connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '',
        pooled: true
      };
    case 'production':
      return {
        connectionString: process.env.DATABASE_URL || '',
        pooled: true
      };
    case 'test':
      return getNeonConfig('development');
    default:
      throw new Error(`Entorno no soportado: ${env}`);
  }
}

// Detectar entorno actual
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  const customEnv = process.env.DATABASE_ENV as Environment;
  
  if (customEnv && ['development', 'production', 'test'].includes(customEnv)) {
    return customEnv;
  }
  
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
function validateConfig(config: NeonConfig, env: Environment): void {
  const errors: string[] = [];
  
  if (!config.connectionString || config.connectionString.includes('placeholder')) {
    errors.push(`Connection string de Neon inválida para entorno ${env}`);
  }
  
  if (!config.connectionString.includes('neon.tech') && !config.connectionString.includes('localhost')) {
    errors.push(`Connection string no parece ser de Neon: ${config.connectionString}`);
  }
  
  if (errors.length > 0) {
    console.error(`❌ Errores de configuración de Neon (${env}):`, errors);
    if (env === 'production') {
      throw new Error(`Configuración de Neon inválida para producción: ${errors.join(', ')}`);
    }
  }
}

// Cache de conexiones por entorno
const connections: Record<Environment, {
  sql?: any;
  pool?: Pool;
  client?: Client;
}> = {
  development: {},
  production: {},
  test: {},
};

// Factory para crear conexión serverless de Neon
export function createNeonConnection(env?: Environment) {
  const environment = env || getCurrentEnvironment();
  
  if (connections[environment].sql) {
    return connections[environment].sql!;
  }
  
  const config = getNeonConfig(environment);
  validateConfig(config, environment);
  
  // Usar el driver serverless de Neon para mejor rendimiento
  const sql = neon(config.connectionString);
  connections[environment].sql = sql;
  
  console.log(`🔗 Conexión Neon serverless creada para entorno: ${environment}`);
  return sql;
}

// Factory para crear pool de conexiones tradicional (para casos específicos)
export function createNeonPool(env?: Environment): Pool {
  const environment = env || getCurrentEnvironment();
  
  if (connections[environment].pool) {
    return connections[environment].pool!;
  }
  
  const config = getNeonConfig(environment);
  validateConfig(config, environment);
  
  const pool = new Pool({
    connectionString: config.connectionString,
    max: 20, // máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  connections[environment].pool = pool;
  
  console.log(`🏊 Pool de conexiones Neon creado para entorno: ${environment}`);
  return pool;
}

// Factory para crear cliente directo (para transacciones)
export function createNeonClient(env?: Environment): Client {
  const environment = env || getCurrentEnvironment();
  
  const config = getNeonConfig(environment);
  validateConfig(config, environment);
  
  const client = new Client({
    connectionString: config.connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  console.log(`👤 Cliente Neon directo creado para entorno: ${environment}`);
  return client;
}

// Exportar instancias por defecto
export const neonSql = createNeonConnection();
export const neonPool = createNeonPool();

// Utilidades para testing y debugging
export function getNeonEnvironmentInfo() {
  const env = getCurrentEnvironment();
  const config = getNeonConfig(env);
  
  return {
    environment: env,
    connectionString: config.connectionString ? config.connectionString.replace(/:[^@]*@/, ':***@') : 'not set',
    hasValidConnection: !!config.connectionString,
    host: config.connectionString ? new URL(config.connectionString).hostname : 'unknown',
    pooled: config.pooled
  };
}

// Función para limpiar conexiones (útil para testing)
export function closeNeonConnections(env?: Environment) {
  const environment = env || getCurrentEnvironment();
  
  if (connections[environment].pool) {
    connections[environment].pool!.end();
    connections[environment].pool = undefined;
  }
  
  if (connections[environment].client) {
    connections[environment].client!.end();
    connections[environment].client = undefined;
  }
  
  // La conexión serverless se limpia automáticamente
  connections[environment].sql = undefined;
  
  console.log(`🧹 Conexiones Neon cerradas para entorno: ${environment}`);
}

// Helper para ejecutar queries con manejo de errores
export async function executeQuery(query: string, params?: any[]): Promise<any> {
  try {
    const sql = createNeonConnection();
    return await sql(query, params || []);
  } catch (error) {
    console.error('Error ejecutando query en Neon:', {
      query: query.substring(0, 100) + '...',
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

// Helper para transacciones
export async function withTransaction<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  const client = createNeonClient();
  
  try {
    await client.connect();
    await client.query('BEGIN');
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
