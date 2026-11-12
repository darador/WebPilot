import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isDemoUser, DEMO_FORBIDDEN_MESSAGE } from '@/lib/auth/roles';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no están configuradas las variables, permitir acceso inicial para configurar
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rutas públicas de páginas (acceso sin login)
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicDemo = pathname.startsWith('/demo');
  const isPublicRoute = isAuthRoute || isPublicDemo;

  // Rutas de API interna
  const isApiRoute = pathname.startsWith('/api');

  // 1. Manejo de peticiones a la API interna
  if (isApiRoute) {
    // Si no hay sesión en cookies ni token Bearer en el encabezado Authorization
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const hasBearer = authHeader?.toLowerCase().startsWith('bearer ');

    if (!user && !hasBearer) {
      return NextResponse.json(
        { error: 'No autorizado. Sesión requerida para acceder a WebPilot AI.' },
        { status: 401 }
      );
    }

    // PROTECCIÓN DE MODO DEMO: Cualquier petición mutadora (POST, PATCH, PUT, DELETE) es rechazada con 403
    const method = request.method.toUpperCase();
    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

    if (user && isDemoUser(user) && isMutation) {
      return NextResponse.json(
        {
          success: false,
          error: DEMO_FORBIDDEN_MESSAGE,
          isDemo: true,
        },
        { status: 403 }
      );
    }

    return supabaseResponse;
  }

  // 2. Manejo de páginas del panel (proteger todas las rutas excepto públicas)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 3. Si el usuario ya está autenticado e intenta ir a /login, redirigir al panel
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
