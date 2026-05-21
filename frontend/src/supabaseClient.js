import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gqzhhwcyfsrwchiboyow.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qVP4PBhjTL9brzseKqLXfQ_mAlzC_0S';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

