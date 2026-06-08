import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function ServicosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const { data: servicos } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('name', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Serviços</h1>
        <a
          href="/dashboard/servicos/novo"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Novo serviço
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Duração</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {servicos && servicos.length > 0 ? (
              servicos.map((servico) => (
                <tr key={servico.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{servico.name}</td>
                  <td className="px-4 py-3 text-gray-500">{servico.duration_minutes} min</td>
                  <td className="px-4 py-3 text-gray-500">
                    {servico.price
                      ? `R$ ${Number(servico.price).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Nenhum serviço cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}