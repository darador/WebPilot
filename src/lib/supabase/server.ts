import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User, SupabaseClient } from '@supabase/supabase-js';

export async function createClient(req?: Request): Promise<SupabaseClient> {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const authHeader = req?.headers.get('authorization') || req?.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  });
}

/**
 * Obtiene el usuario autenticado (Daro o Julieta) verificando tanto el Bearer token
 * enviado desde el cliente como las cookies de sesión del navegador.
 */
export async function getAuthenticatedUser(
  req?: Request
): Promise<{ user: User | null; supabase: SupabaseClient }> {
  const authHeader = req?.headers.get('authorization') || req?.headers.get('Authorization');
  const hasAuthHeader = !!authHeader;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const hasBearerToken = !!bearerToken;

  console.log('[Lola Auth Server] ========================================');
  console.log('[Lola Auth Server] Verificando autenticación en servidor:');
  console.log('[Lola Auth Server] 1. ¿Servidor recibió encabezado Authorization?:', hasAuthHeader);
  console.log('[Lola Auth Server] 2. ¿Formato Bearer detectado?:', hasBearerToken);

  const supabase = await createClient(req);

  // 1. Si el cliente envió un Bearer token (desde su sesión activa de Supabase Auth):
  if (bearerToken) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
      console.log('[Lola Auth Server] 3. Resultado validación Bearer token en Supabase:', {
        usuarioEncontrado: !!user,
        email: user?.email || null,
        error: error ? error.message : null,
      });
      if (!error && user) {
        console.log('[Lola Auth Server] -> Autenticado exitosamente vía Bearer token.');
        console.log('[Lola Auth Server] ========================================');
        return { user, supabase };
      }
    } catch (err: any) {
      console.error('[Lola Auth Server] Excepción al validar Bearer token:', err?.message);
    }
  }

  // 2. Si no hay Bearer token o expiró, verificar cookies del navegador
  let cookieNames: string[] = [];
  try {
    const cookieStore = cookies();
    cookieNames = cookieStore.getAll().map((c) => c.name);
  } catch (e: any) {
    console.error('[Lola Auth Server] Error al leer cookies del servidor:', e?.message);
  }
  console.log('[Lola Auth Server] 4. Nombres de cookies recibidas:', cookieNames);

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('[Lola Auth Server] 5. Resultado validación Cookies en Supabase:', {
      usuarioEncontrado: !!user,
      email: user?.email || null,
      error: error ? error.message : null,
    });
    if (!error && user) {
      console.log('[Lola Auth Server] -> Autenticado exitosamente vía Cookies.');
      console.log('[Lola Auth Server] ========================================');
      return { user, supabase };
    }
  } catch (err: any) {
    console.error('[Lola Auth Server] Excepción al validar Cookies:', err?.message);
  }

  console.log('[Lola Auth Server] 6. Resultado final: Rechazado (401 - Sesión no iniciada)');
  console.log('[Lola Auth Server] ========================================');
  return { user: null, supabase };
}
