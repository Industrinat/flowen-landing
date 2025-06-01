// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mrkocxttqgpjtflyzfqpj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ya29jeHR0cWdwanRmbHpmcXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODUyODQsImV4cCI6MjA2NDI2MTI4NH0.64eE6xYqiRkdBGf_SfqqWlZcl4M1jF0ousPlbZVHWxM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
