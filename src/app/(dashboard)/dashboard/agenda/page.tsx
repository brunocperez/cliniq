import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AgendaPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const { data: consultas } = await supabase
    .from('appointments')
    .select('*, patients(name, phone)')
    .eq('tenant_id', profile?.tenant_id)
    .order('scheduled_at', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Agenda</h1>
        <a
          href="/dashboard/agenda/nova"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Nova consulta
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Paciente</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Data e hora</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {consultas && consultas.length > 0 ? (
              consultas.map((consulta) => (
                <tr key={consulta.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {(consulta.patients as { name: string } | null)?.name ?? 'Paciente'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      consulta.status === 'confirmado' ? 'bg-green-50 text-green-700' :
                      consulta.status === 'realizado' ? 'bg-blue-50 text-blue-700' :
                      consulta.status === 'faltou' ? 'bg-red-50 text-red-700' :
                      consulta.status === 'cancelado' ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {consulta.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma consulta agendada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}