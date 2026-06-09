import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function gerarSenha() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 10; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return senha
}

export async function POST(request: NextRequest) {
  const { nome, plano, email, especialidade, whatsappConsultorio, nomeResponsavel, whatsappResponsavel } = await request.json()

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
    .insert({
      name: nome,
      plan: plano,
      specialty: especialidade,
      whatsapp_consultorio: whatsappConsultorio,
    })
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
      responsible_name: nomeResponsavel,
      whatsapp_responsavel: whatsappResponsavel,
      first_login: true,
    })

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    await adminSupabase.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
  }

  // 5. Envia e-mail via Resend
  const { error: emailError } = await resend.emails.send({
    from: 'ClinicSaaS <onboarding@resend.dev>',
    to: email,
    subject: 'Seu acesso ao ClinicSaaS',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; font-weight: 500;">Bem-vindo ao ClinicSaaS!</h2>
        <p style="color: #555;">Seu consultório <strong>${nome}</strong> foi cadastrado com sucesso.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>E-mail:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Senha temporária:</strong> <code>${senha}</code></p>
        </div>
        <p style="color: #555;">
          Acesse: <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">${process.env.NEXT_PUBLIC_APP_URL}/login</a>
        </p>
        <p style="color: #888; font-size: 13px;">Você será solicitado a trocar sua senha no primeiro acesso.</p>
      </div>
    `,
  })

  if (emailError) {
    console.log('Erro ao enviar e-mail:', emailError)
  }

  return NextResponse.json({ success: true, senha })
}