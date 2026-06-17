import { createServerSupabaseClient } from '@/lib/supabase/server'
import PagamentoView from '@/components/dashboard/PagamentoView'

export default async function PagamentoPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

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

  return (
    <div className="max-w-lg">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Pagamento</h1>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Gerencie sua forma de pagamento e cobranças</p>
      </div>

      <PagamentoView
        tenantId={profile?.tenant_id ?? ''}
        configInicial={config ?? null}
        cobrancas={cobrancas ?? []}
      />
    </div>
  )
}