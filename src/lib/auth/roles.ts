import type { User } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'DEMO' | 'ANONYMOUS';

/**
 * Determina el rol de un usuario autenticado.
 * - 'DEMO': si el email es demo@darador.com o si metadata contiene role = 'DEMO'.
 * - 'ADMIN': Daro, Julieta o cualquier operador administrativo.
 * - 'ANONYMOUS': si no hay sesión activa.
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'ANONYMOUS';

  const email = (user.email || '').toLowerCase().trim();
  if (email === 'demo@darador.com') {
    return 'DEMO';
  }

  const role = (
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    ''
  ).toString().toUpperCase().trim();

  if (role === 'DEMO' || role === 'READ_ONLY' || role === 'READONLY') {
    return 'DEMO';
  }

  return 'ADMIN';
}

/**
 * Comprueba si el usuario está navegando con la cuenta de demostración (solo lectura).
 */
export function isDemoUser(user: User | null): boolean {
  return getUserRole(user) === 'DEMO';
}

/**
 * Comprueba si el usuario tiene permisos administrativos completos (Daro o Julieta).
 */
export function isAdminUser(user: User | null): boolean {
  return getUserRole(user) === 'ADMIN';
}

export const DEMO_FORBIDDEN_MESSAGE =
  'Acción no permitida: Estás navegando con una cuenta de demostración en modo solo lectura.';

/**
 * Valida si el usuario tiene permiso para mutar o ejecutar acciones.
 */
export function assertCanMutate(user: User | null): { allowed: boolean; error?: string } {
  if (!user) {
    return {
      allowed: false,
      error: 'Sesión no iniciada. Por favor iniciá sesión.',
    };
  }

  if (isDemoUser(user)) {
    return {
      allowed: false,
      error: DEMO_FORBIDDEN_MESSAGE,
    };
  }

  return { allowed: true };
}
