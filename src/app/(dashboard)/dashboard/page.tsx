import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
    .single()

  const tenantId = profile?.tenant_id

  // Total de pacientes
  const { count: totalPacientes } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // Consultas hoje
  const hoje = new Date()
  const inicioDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString()
  const fimDia = new Date(hoje.setHours(23, 59, 59, 999)).toISOString()

  const { count: consultasHoje } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', inicioDia)
    .lte('scheduled_at', fimDia)

  // Próximas consultas
  const { data: proximasConsultas } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Olá, {profile?.full_name}</h1>
        <p className="text-sm text-gray-500">Aqui está o resumo do seu consultório</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total de pacientes</p>
          <p className="text-2xl font-medium">{totalPacientes ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Consultas hoje</p>
          <p className="text-2xl font-medium">{consultasHoje ?? 0}</p>
        </div>
      </div>

      {/* Próximas consultas */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium">Próximas consultas</h2>
        </div>
        {proximasConsultas && proximasConsultas.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {proximasConsultas.map((consulta) => (
              <div key={consulta.id} className="px-5 py-3 flex items-center justify-between">
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  consulta.status === 'confirmado'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {consulta.status}
                </span>
              </div>
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