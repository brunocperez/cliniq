import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { nomeConsultorio, nomeResponsavel, whatsappResponsavel, email, senha } = await request.json()

  if (!nomeConsultorio || !nomeResponsavel || !whatsappResponsavel || !email || !senha) {
    return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Calcula data de fim do trial (30 dias a partir de hoje)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  // 1. Cria o tenant
  const { data: tenant, error: tenantError } = await adminSupabase
    .from('tenants')
    .insert({
      name: nomeConsultorio,
      specialty: 'Odontologia',
      plano: 'trial',
      trial_ends_at: trialEndsAt.toISOString(),
      is_active: true,
    })
    .select()
    .single()

  if (tenantError) {
    return NextResponse.json({ error: 'Erro ao criar consultório.' }, { status: 500 })
  }

  // 2. Cria o usuário com a senha escolhida
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    await adminSupabase.from('tenants').delete().eq('id', tenant.id)
    const mensagem = authError.message.includes('already been registered')
      ? 'Este e-mail já está cadastrado.'
      : 'Erro ao criar usuário.'
    return NextResponse.json({ error: mensagem }, { status: 500 })
  }

  // 3. Cria o profile
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      role: 'client',
      full_name: nomeConsultorio,
      responsible_name: nomeResponsavel,
      whatsapp_responsavel: whatsappResponsavel,
      first_login: false,
    })

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    await adminSupabase.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json({ error: 'Erro ao criar perfil.' }, { status: 500 })
  }

  // 4. Envia e-mail de boas-vindas
  const { error: emailError } = await resend.emails.send({
    from: 'Cliniq <onboarding@resend.dev>',
    to: email,
    subject: 'Bem-vindo ao Cliniq! 🦷',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; font-weight: 500;">Bem-vindo ao Cliniq!</h2>
        <p style="color: #555;">Seu consultório <strong>${nomeConsultorio}</strong> foi cadastrado com sucesso.</p>
        <p style="color: #555;">Você tem <strong>30 dias gratuitos</strong> para testar todas as funcionalidades.</p>
        <p style="color: #555;">
          Acesse: <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">${process.env.NEXT_PUBLIC_APP_URL}/login</a>
        </p>
      </div>
    `,
  })

  if (emailError) {
    console.log('Erro ao enviar e-mail:', emailError)
  }

  return NextResponse.json({ success: true })
}