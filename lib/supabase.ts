import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Environment variable validation with runtime checks
function validateSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const errors: string[] = [];

  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is missing or using placeholder value');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or using placeholder value');
  }

  if (!supabaseServiceKey || supabaseServiceKey === 'placeholder-service-key') {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is missing or using placeholder value');
  }


  return {
    supabaseUrl: supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey: supabaseAnonKey || 'placeholder-key',
    supabaseServiceKey: supabaseServiceKey || 'placeholder-service-key',
    isValid: errors.length === 0
  };
}

const config = validateSupabaseConfig();

// Supabase client options for better error handling and timeouts
const supabaseOptions = {
  auth: {
    persistSession: false, // Server-side doesn't need session persistence
  },
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      // Add timeout and better error handling to fetch calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
};

export const supabase = createClient<Database>(
  config.supabaseUrl, 
  config.supabaseAnonKey,
  supabaseOptions
);

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient<Database>(
  config.supabaseUrl,
  config.supabaseServiceKey,
  supabaseOptions
);

// Export config validation status for runtime checks
export const supabaseConfigValid = config.isValid;
