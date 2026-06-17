import { createServerSupabaseClient } from '@/lib/supabase/server'
import MetricasView from '@/components/dashboard/MetricasView'

export default async function MetricasPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const tenantId = profile?.tenant_id

  const { count: totalPacientes } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('archived', false)

  const { count: totalConsultas } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const { count: totalRealizadas } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'realizado')

  const { count: totalFaltou } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'faltou')

  const { data: consultasRealizadas } = await supabase
    .from('appointments')
    .select('services(price)')
    .eq('tenant_id', tenantId)
    .eq('status', 'realizado')

  const receitaTotal = consultasRealizadas?.reduce((acc, c) => {
    const price = (c.services as unknown as { price: number } | null)?.price ?? 0
    return acc + Number(price)
  }, 0) ?? 0

  const taxaNoShow = totalConsultas
    ? Math.round(((totalFaltou ?? 0) / totalConsultas) * 100)
    : 0

  // Dados para gráficos
  const { data: todasConsultas } = await supabase
    .from('appointments')
    .select('scheduled_at, status, services(name, price)')
    .eq('tenant_id', tenantId)
    .order('scheduled_at', { ascending: true })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Métricas</h1>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Desempenho do seu consultório</p>
      </div>

      <MetricasView
        totalPacientes={totalPacientes ?? 0}
        totalConsultas={totalConsultas ?? 0}
        totalRealizadas={totalRealizadas ?? 0}
        totalFaltou={totalFaltou ?? 0}
        receitaTotal={receitaTotal}
        taxaNoShow={taxaNoShow}
        consultas={todasConsultas ?? []}
      />
    </div>
  )
}