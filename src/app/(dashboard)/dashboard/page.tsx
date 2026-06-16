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
  const inicioDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString()
  const fimDia = new Date(hoje.setHours(23, 59, 59, 999)).toISOString()

  const { count: consultasHoje } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', inicioDia)
    .lte('scheduled_at', fimDia)

  const { data: proximasConsultas } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .eq('archived', false)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Olá, {profile?.full_name} 👋</h1>
        <p className="text-sm text-gray-500">Aqui está o resumo do seu consultório</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5 text-white" style={{ backgroundColor: '#0F6E56' }}>
          <p className="text-xs mb-1 opacity-80">Total de pacientes</p>
          <p className="text-2xl font-medium">{totalPacientes ?? 0}</p>
        </div>
        <div className="rounded-xl p-5 text-white" style={{ backgroundColor: '#1D9E75' }}>
          <p className="text-xs mb-1 opacity-80">Consultas hoje</p>
          <p className="text-2xl font-medium">{consultasHoje ?? 0}</p>
        </div>
      </div>

      <Card
        title="Próximas consultas"
        padded={false}
        action={
          <Link href="/dashboard/agenda" className="text-xs hover:opacity-70" style={{ color: '#0F6E56' }}>
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
              >
                <div>
                  <p className="text-sm font-medium">
                    {(consulta.patients as { name: string } | null)?.name ?? 'Paciente'}
                  </p>
                  <p className="text-xs text-gray-500">
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
          <p className="px-5 py-8 text-sm text-center text-gray-400">
            Nenhuma consulta agendada.
          </p>
        )}
      </Card>
    </div>
  )
}