'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserRole, isDemoUser, isAdminUser, UserRole } from '@/lib/auth/roles';
import type { User } from '@supabase/supabase-js';

export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('ANONYMOUS');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setRole(getUserRole(user));
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setRole(getUserRole(currentUser));
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    isDemo: role === 'DEMO',
    isAdmin: role === 'ADMIN',
    isLoading,
  };
}
