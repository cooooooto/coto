// Importar la nueva configuración de entornos múltiples
export { 
  supabase, 
  supabaseAdmin,
  createSupabaseClient,
  createSupabaseAdminClient,
  getEnvironmentInfo,
  switchEnvironment
} from './supabase-config';

// Mantener compatibilidad hacia atrás
export { supabase as default } from './supabase-config';

// Re-exportar tipos para conveniencia
export type { Environment } from './supabase-config';
