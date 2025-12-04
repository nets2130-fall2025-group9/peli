import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/supabase/types'

export function createSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        // trying to get auth, there was an error here so can return null
        try {
          const authResult = await auth();
          if (!authResult) {
            return null;
          }
          return await authResult.getToken();
        } catch (error) {
          return null;
        }
      },
    },
  )
}

export function createAdminSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}