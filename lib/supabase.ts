import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Use placeholder values during build if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);
