/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

// No Vite, usamos import.meta.env em vez de process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL e Anon Key são obrigatórios')
}

export const supabase = createClient(supabaseUrl, supabaseKey)