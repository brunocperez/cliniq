import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rateLimit'

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
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  if (!rateLimit(ip, 3, 60)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  }
  const { userId, nomeConsultorio } = await request.json()

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

  // Busca o e-mail do usuário
  const { data: userData } = await adminSupabase.auth.admin.getUserById(userId)
  const email = userData?.user?.email ?? ''

  // Gera nova senha
  const novaSenha = gerarSenha()

  // Atualiza a senha do usuário
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
    password: novaSenha,
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Marca first_login como true para forçar troca de senha
  await adminSupabase
    .from('profiles')
    .update({ first_login: true })
    .eq('id', userId)

  // Envia e-mail com nova senha
  await resend.emails.send({
    from: 'ClinicSaaS <onboarding@resend.dev>',
    to: email,
    subject: 'Sua senha foi redefinida — ClinicSaaS',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; font-weight: 500;">Senha redefinida</h2>
        <p style="color: #555;">A senha do consultório <strong>${nomeConsultorio}</strong> foi redefinida.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>E-mail:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Nova senha temporária:</strong> <code>${novaSenha}</code></p>
        </div>
        <p style="color: #555;">
          Acesse: <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">${process.env.NEXT_PUBLIC_APP_URL}/login</a>
        </p>
        <p style="color: #888; font-size: 13px;">Você será solicitado a trocar sua senha no próximo acesso.</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true, senha: novaSenha })
}