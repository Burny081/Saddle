// Client Supabase partagé
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client with fallback for development (prevents null errors)
export const supabase: SupabaseClient = 
  supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : createClient('https://placeholder.supabase.co', 'placeholder-key'); // Temporary fallback

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => 
  Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'));
