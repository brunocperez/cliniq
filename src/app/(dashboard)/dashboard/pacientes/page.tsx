import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function PacientesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const { data: pacientes } = await supabase
    .from('patients')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('name', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Pacientes</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">WhatsApp</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {pacientes && pacientes.length > 0 ? (
              pacientes.map((paciente) => (
                <tr key={paciente.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{paciente.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{paciente.phone}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Nenhum paciente cadastrado ainda. Eles aparecem automaticamente quando entrarem em contato pelo WhatsApp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}