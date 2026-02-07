import { SupabaseClient } from '@supabase/supabase-js';

export function createClient(url: string, key: string): SupabaseClient;