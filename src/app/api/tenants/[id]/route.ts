import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

async function verificarAdmin() {
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
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null

  return user
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await verificarAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', id)
    .eq('role', 'client')
    .single()

  return NextResponse.json({ tenant, profile })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { nomeConsultorio, especialidade, whatsappConsultorio, nomeResponsavel, whatsappResponsavel, profileId } = await request.json()

  const user = await verificarAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: tenantError } = await adminSupabase
    .from('tenants')
    .update({
      name: nomeConsultorio,
      specialty: especialidade,
      whatsapp_consultorio: whatsappConsultorio,
    })
    .eq('id', id)

  if (tenantError) {
    return NextResponse.json({ error: 'Erro ao atualizar tenant.' }, { status: 500 })
  }

  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({
      responsible_name: nomeResponsavel,
      full_name: nomeConsultorio,
      whatsapp_responsavel: whatsappResponsavel,
    })
    .eq('id', profileId)

  if (profileError) {
    return NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}