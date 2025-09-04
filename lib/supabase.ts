import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const { EXPO_PUBLIC_API_URL: API_URL, EXPO_PUBLIC_API_KEY: API_KEY } = process.env

if (!API_URL || !API_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(API_URL, API_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})