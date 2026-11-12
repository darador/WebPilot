'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(
        err.message || 'Error en la autenticación. Verificá tus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-[#1b263e] bg-[#0c1220]/90 backdrop-blur-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">WebPilot</h1>
            <span className="text-cyan-400 font-black text-xs uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
              AI
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Centro de operaciones y agentes autónomos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@webpilot.ai"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#070b14] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#070b14] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <span>
              {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1a2336] flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Acceso Privado e Intransferible</span>
          </div>
          <p className="text-[10px] text-slate-500 max-w-xs">
            Registro público inhabilitado. El ingreso requiere una cuenta previamente creada y autorizada por el administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
