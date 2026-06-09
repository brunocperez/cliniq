import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

function gerarSenha() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 10; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return senha
}

export async function POST(request: NextRequest) {
  const { nome, plano, email } = await request.json()

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

  // 2. Gera senha aleatória
  const senha = gerarSenha()

  // 3. Cria o usuário
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    // Reverte o tenant se falhar
    await adminSupabase.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // 4. Cria o profile
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      role: 'client',
      full_name: nome,
      first_login: true,
    })

  if (profileError) {
    // Reverte usuário e tenant se falhar
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    await adminSupabase.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
  }

  return NextResponse.json({ success: true, senha })
}