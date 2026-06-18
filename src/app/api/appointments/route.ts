import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const { pacienteId, servicoId, scheduledAt, duracao } = await request.json()

  if (!pacienteId || !scheduledAt) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // tenant_id sempre vem do servidor, nunca do cliente
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Tenant não encontrado.' }, { status: 403 })
  }

  const tenantId = profile.tenant_id

  // Verifica conflito de horário no servidor
  const inicio = new Date(scheduledAt)
  const fim = new Date(inicio.getTime() + (duracao ?? 60) * 60000)
  const inicioDia = new Date(inicio)
  inicioDia.setHours(0, 0, 0, 0)
  const fimDia = new Date(inicio)
  fimDia.setHours(23, 59, 59, 999)

  const { data: existentes } = await adminSupabase
    .from('appointments')
    .select('scheduled_at, services(duration_minutes)')
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', inicioDia.toISOString())
    .lte('scheduled_at', fimDia.toISOString())
    .not('status', 'in', '("cancelado","faltou")')

  const temConflito = existentes?.some(c => {
    const eInicio = new Date(c.scheduled_at)
    const eDuracao = (c.services as unknown as { duration_minutes: number } | null)?.duration_minutes ?? 60
    const eFim = new Date(eInicio.getTime() + eDuracao * 60000)
    return inicio < eFim && fim > eInicio
  })

  if (temConflito) {
    return NextResponse.json({ error: 'Já existe uma consulta neste horário.' }, { status: 409 })
  }

  const { error } = await adminSupabase
    .from('appointments')
    .insert({
      tenant_id: tenantId,
      patient_id: pacienteId,
      service_id: servicoId || null,
      scheduled_at: scheduledAt,
      status: 'agendado',
    })

  if (error) {
    return NextResponse.json({ error: 'Erro ao criar consulta.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}