import { createClient } from '@supabase/supabase-js';

const apiUrl = import.meta.env.VITE_SUPABASE_API_URL;
const apiKey = import.meta.env.VITE_SUPABASE_API_KEY;

export const supabase  = createClient(apiUrl, apiKey);