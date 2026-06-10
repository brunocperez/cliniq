import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

  const statusCores: Record<string, string> = {
    agendado: 'bg-yellow-50 text-yellow-700',
    confirmado: 'bg-green-50 text-green-700',
    realizado: 'bg-blue-50 text-blue-700',
    faltou: 'bg-red-50 text-red-700',
    cancelado: 'bg-gray-100 text-gray-500',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Olá, {profile?.full_name}</h1>
        <p className="text-sm text-gray-500">Aqui está o resumo do seu consultório</p>
      </div>

      {/* Cards de métricas */}
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

      {/* Próximas consultas */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium">Próximas consultas</h2>
          <Link href="/dashboard/agenda" className="text-xs hover:opacity-70" style={{ color: '#0F6E56' }}>
            Ver agenda →
          </Link>
        </div>
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
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusCores[consulta.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {consulta.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-center text-gray-400">
            Nenhuma consulta agendada.
          </p>
        )}
      </div>
    </div>
  )
}