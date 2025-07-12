import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide fallback values to prevent URL constructor errors
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3NzEyMDAiLCJleHAiOjE5NjUzNDcyMDB9.placeholder'

// Function to validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Use fallback values if environment variables are missing or invalid
const finalUrl = (supabaseUrl && supabaseUrl.trim() !== '' && isValidUrl(supabaseUrl)) 
  ? supabaseUrl 
  : defaultUrl

const finalKey = (supabaseAnonKey && supabaseAnonKey.trim() !== '') 
  ? supabaseAnonKey 
  : defaultKey

if (finalUrl === defaultUrl || finalKey === defaultKey) {
  console.warn('Supabase environment variables are not properly configured. Using placeholder values.')
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
  console.warn('Click "Connect to Supabase" button to set up your database connection')
}

export const supabase = createClient(finalUrl, finalKey)