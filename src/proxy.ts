import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Se não está logado e tenta acessar área protegida → login
  if (!user && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se já está logado e tenta acessar o login → dashboard
  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Verifica se o tenant está ativo
  if (user && path.startsWith('/dashboard')) {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.tenant_id) {
      const { data: tenant } = await adminSupabase
        .from('tenants')
        .select('is_active')
        .eq('id', profile.tenant_id)
        .single()

      if (tenant && !tenant.is_active && path !== '/bloqueado') {
        return NextResponse.redirect(new URL('/bloqueado', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}