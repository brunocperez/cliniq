import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import Card from '@/components/ui/Card'

type Status = 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
    .single()

  const tenantId = profile?.tenant_id

  const { count: totalPacientes } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('archived', false)

  const hoje = new Date()
  const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0).toISOString()
  const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString()

  const { count: consultasHoje } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', inicioDia)
    .lte('scheduled_at', fimDia)
    .not('status', 'in', '("cancelado","faltou")')

  const { data: consultasHojeDetalhes } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', inicioDia)
    .lte('scheduled_at', fimDia)
    .not('status', 'in', '("cancelado","faltou")')
    .order('scheduled_at', { ascending: true })

  const { data: consultasRealizadas } = await supabase
    .from('appointments')
    .select('services(price)')
    .eq('tenant_id', tenantId)
    .eq('status', 'realizado')
    .gte('scheduled_at', inicioDia)
    .lte('scheduled_at', fimDia)

  const receitaHoje = consultasRealizadas?.reduce((acc, c) => {
    const price = (c.services as unknown as { price: number } | null)?.price ?? 0
    return acc + Number(price)
  }, 0) ?? 0

  const { data: proximasConsultas } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .eq('archived', false)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  const temConsultasHoje = (consultasHoje ?? 0) > 0

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
          Olá, {profile?.full_name} 👋
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Aqui está o resumo do seu consultório
        </p>
      </div>

      {/* Banner de consultas hoje */}
      {temConsultasHoje && (
        <div style={{
          background: 'var(--cliniq-50)',
          border: '1px solid var(--cliniq-500)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📅</span>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>
                Você tem {consultasHoje} consulta{(consultasHoje ?? 0) > 1 ? 's' : ''} hoje
              </p>
              {consultasHojeDetalhes && consultasHojeDetalhes.length > 0 && (
                <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Próxima: {(consultasHojeDetalhes[0].patients as { name: string } | null)?.name ?? 'Paciente'} às{' '}
                  {new Date(consultasHojeDetalhes[0].scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
          <Link href="/dashboard/agenda" style={{ fontSize: 'var(--text-xs)', color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }}>
            Ver agenda →
          </Link>
        </div>
      )}

      {/* Cards de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ borderRadius: 'var(--radius-lg)', padding: 20, color: 'white', background: 'var(--brand)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', opacity: 0.8 }}>Total de pacientes</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-medium)' }}>{totalPacientes ?? 0}</p>
        </div>
        <div style={{ borderRadius: 'var(--radius-lg)', padding: 20, color: 'white', background: 'var(--cliniq-500)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', opacity: 0.8 }}>Consultas hoje</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-medium)' }}>{consultasHoje ?? 0}</p>
        </div>
        <div style={{ borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Receita hoje</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
            {receitaHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div style={{ borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Próxima consulta</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
            {proximasConsultas && proximasConsultas.length > 0
              ? new Date(proximasConsultas[0].scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
              : '—'
            }
          </p>
        </div>
      </div>

      <Card
        title="Próximas consultas"
        padded={false}
        action={
          <Link href="/dashboard/agenda" className="text-xs hover:opacity-70" style={{ color: 'var(--brand)' }}>
            Ver agenda →
          </Link>
        }
      >
        {proximasConsultas && proximasConsultas.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {proximasConsultas.map((consulta) => (
              <Link
                key={consulta.id}
                href={`/dashboard/agenda/${consulta.id}`}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50"
                style={{ display: 'flex' }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                    {(consulta.patients as { name: string } | null)?.name ?? 'Paciente'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <StatusBadge status={consulta.status as Status} />
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ padding: '32px 20px', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-faint)' }}>
            Nenhuma consulta agendada.
          </p>
        )}
      </Card>
    </div>
  )
}
