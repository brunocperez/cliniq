import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const { nome, plano, email, senha } = await request.json()

  // Cliente normal para verificar se é admin
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)),
      },
    }
  )

  // Verifica se quem está chamando é admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Cliente admin com service_role
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Cria o tenant
  const { data: tenant, error: tenantError } = await adminSupabase
    .from('tenants')
    .insert({ name: nome, plan: plano })
    .select()
    .single()

  if (tenantError) {
    return NextResponse.json({ error: 'Erro ao criar tenant' }, { status: 500 })
  }

  // 2. Cria o usuário
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // 3. Cria o profile
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      role: 'client',
      full_name: nome,
    })

  if (profileError) {
    return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}