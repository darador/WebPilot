import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import {
  getUserRole,
  isDemoUser,
  isAdminUser,
  assertCanMutate,
  DEMO_FORBIDDEN_MESSAGE,
  UserRole,
} from '@/lib/auth/roles';

export {
  getUserRole,
  isDemoUser,
  isAdminUser,
  assertCanMutate,
  DEMO_FORBIDDEN_MESSAGE,
};
export type { UserRole };

export interface AuthenticatedUserContext {
  user: User | null;
  supabase: SupabaseClient;
  role: UserRole;
  isDemo: boolean;
  canMutate: boolean;
}

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
): Promise<AuthenticatedUserContext> {
  const authHeader = req?.headers.get('authorization') || req?.headers.get('Authorization');
  const hasAuthHeader = !!authHeader;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const hasBearerToken = !!bearerToken;

  const supabase = await createClient(req);

  // 1. Si el cliente envió un Bearer token (desde su sesión activa de Supabase Auth):
  if (bearerToken) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
      if (!error && user) {
        const role = getUserRole(user);
        return {
          user,
          supabase,
          role,
          isDemo: role === 'DEMO',
          canMutate: role === 'ADMIN',
        };
      }
    } catch (err: any) {
      console.error('[WebPilot Auth Server] Excepción al validar Bearer token:', err?.message);
    }
  }

  // 2. Si no hay Bearer token o expiró, verificar cookies del navegador
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      const role = getUserRole(user);
      return {
        user,
        supabase,
        role,
        isDemo: role === 'DEMO',
        canMutate: role === 'ADMIN',
      };
    }
  } catch (err: any) {
    console.error('[WebPilot Auth Server] Excepción al validar Cookies:', err?.message);
  }

  return {
    user: null,
    supabase,
    role: 'ANONYMOUS',
    isDemo: false,
    canMutate: false,
  };
}
