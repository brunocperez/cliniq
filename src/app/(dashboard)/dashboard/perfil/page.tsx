import { createServerSupabaseClient } from '@/lib/supabase/server'
import PerfilView from '@/components/dashboard/PerfilView'

export default async function PerfilPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { data: { user } },
    { data: profile },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*, tenants(name, specialty, whatsapp_consultorio)').single(),
  ])

  const tenant = Array.isArray(profile?.tenants) ? profile.tenants[0] : profile?.tenants

  const { data: config } = await supabase
    .from('billing_settings')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .single()

  const { data: cobrancas } = await supabase
    .from('cobrancas')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('created_at', { ascending: false })
    .limit(6)

  const nome = profile?.responsible_name ?? profile?.full_name ?? ''
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <PerfilView
      nome={nome}
      iniciais={iniciais}
      email={user?.email ?? ''}
      tenantNome={tenant?.name ?? ''}
      tenantEspecialidade={tenant?.specialty ?? ''}
      tenantWhatsapp={tenant?.whatsapp_consultorio ?? ''}
      responsavelNome={profile?.responsible_name ?? ''}
      responsavelWhatsapp={profile?.whatsapp_responsavel ?? ''}
      tenantId={profile?.tenant_id ?? ''}
      configPagamento={config ?? null}
      cobrancas={cobrancas ?? []}
    />
  )
}