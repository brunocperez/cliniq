import { createClient } from '@supabase/supabase-js'
import Card from '@/components/ui/Card'

export default async function AdminMetricasPage() {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hoje = new Date()
  const inicioAno = new Date(hoje.getFullYear(), 0, 1).toISOString()

  const [
    { data: tenants },
    { data: cobrancas },
  ] = await Promise.all([
    adminSupabase.from('tenants').select('id, name, created_at, plano, trial_ends_at, is_active'),
    adminSupabase.from('cobrancas').select('valor, status, created_at, tenant_id').gte('created_at', inicioAno),
  ])

  // Crescimento — novas clínicas por mês (últimos 6 meses)
  const crescimentoPorMes = (() => {
    const meses: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      meses[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
    }
    tenants?.forEach(t => {
      const key = new Date(t.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) meses[key]++
    })
    return Object.entries(meses).map(([mes, total]) => ({ mes, total }))
  })()

  // Receita — por mês (últimos 6 meses, só pagas)
  const receitaPorMes = (() => {
    const meses: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      meses[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
    }
    cobrancas?.filter(c => c.status === 'pago').forEach(c => {
      const key = new Date(c.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) meses[key] += Number(c.valor)
    })
    return Object.entries(meses).map(([mes, receita]) => ({ mes, receita: Math.round(receita) }))
  })()

  // Totais
  const totalTenants = tenants?.length ?? 0
  const totalAtivos = tenants?.filter(t => t.is_active).length ?? 0
  const totalTrial = tenants?.filter(t => t.plano === 'trial' && t.trial_ends_at && new Date(t.trial_ends_at) > hoje).length ?? 0
  const totalTrialExpirado = tenants?.filter(t => t.plano === 'trial' && t.trial_ends_at && new Date(t.trial_ends_at) < hoje).length ?? 0
  const receitaTotal = cobrancas?.filter(c => c.status === 'pago').reduce((acc, c) => acc + Number(c.valor), 0) ?? 0
  const receitaPendente = cobrancas?.filter(c => c.status === 'pendente').reduce((acc, c) => acc + Number(c.valor), 0) ?? 0

  const maxCrescimento = Math.max(...crescimentoPorMes.map(m => m.total), 1)
  const maxReceita = Math.max(...receitaPorMes.map(m => m.receita), 1)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>Métricas</h1>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Visão geral da plataforma</p>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total de clínicas', value: totalTenants, tone: 'default' },
          { label: 'Clínicas ativas', value: totalAtivos, tone: 'brand' },
          { label: 'Em trial', value: totalTrial, tone: 'warning' },
          { label: 'Trial expirado', value: totalTrialExpirado, tone: 'danger' },
          { label: 'Receita confirmada', value: receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), tone: 'accent' },
          { label: 'Receita pendente', value: receitaPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), tone: 'default' },
        ].map(({ label, value, tone }) => (
          <div key={label} style={{
            background: tone === 'brand' ? 'var(--brand)' : tone === 'accent' ? 'var(--cliniq-500)' : 'var(--surface-card)',
            border: ['default', 'warning', 'danger'].includes(tone) ? '1px solid var(--border-default)' : 'none',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: ['brand', 'accent'].includes(tone) ? 'rgba(255,255,255,0.8)' : tone === 'warning' ? 'var(--agendado-ink)' : tone === 'danger' ? 'var(--faltou-ink)' : 'var(--text-muted)' }}>
              {label}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: ['brand', 'accent'].includes(tone) ? 'white' : tone === 'warning' ? 'var(--agendado-ink)' : tone === 'danger' ? 'var(--faltou-ink)' : 'var(--text-strong)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Crescimento por mês */}
        <Card title="Novas clínicas por mês">
          {crescimentoPorMes.every(m => m.total === 0) ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', textAlign: 'center', padding: '32px 0' }}>Sem dados ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              {crescimentoPorMes.map(({ mes, total }) => (
                <div key={mes} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 56, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>{mes}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--border-divider)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: `${(total / maxCrescimento) * 100}%`, height: '100%', background: 'var(--brand)', borderRadius: 9999, minWidth: total > 0 ? 4 : 0 }} />
                  </div>
                  <span style={{ width: 20, textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-body)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{total}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Receita por mês */}
        <Card title="Receita por mês">
          {receitaPorMes.every(m => m.receita === 0) ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', textAlign: 'center', padding: '32px 0' }}>Sem cobranças pagas ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              {receitaPorMes.map(({ mes, receita }) => (
                <div key={mes} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 56, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>{mes}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--border-divider)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: `${(receita / maxReceita) * 100}%`, height: '100%', background: 'var(--cliniq-500)', borderRadius: 9999, minWidth: receita > 0 ? 4 : 0 }} />
                  </div>
                  <span style={{ width: 64, textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-body)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}