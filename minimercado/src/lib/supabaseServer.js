import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // O erro aqui é ignorado de propósito por causa do Next.js
          }
        },
        remove(name, options) {
          try {
            // Para deletar o cookie no Next.js
            cookieStore.set({ name, value: '', ...options }); 
          } catch (error) {
          }
        },
      },
    }
  );
}