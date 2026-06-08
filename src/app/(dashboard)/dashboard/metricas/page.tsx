import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function MetricasPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const tenantId = profile?.tenant_id

  // Total de pacientes
  const { count: totalPacientes } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // Total de consultas
  const { count: totalConsultas } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // Consultas realizadas
  const { count: totalRealizadas } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'realizado')

  // Consultas que faltou
  const { count: totalFaltou } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'faltou')

  // Receita total (consultas realizadas com serviço vinculado)
  const { data: consultasRealizadas } = await supabase
    .from('appointments')
    .select('services(price)')
    .eq('tenant_id', tenantId)
    .eq('status', 'realizado')

  const receitaTotal = consultasRealizadas?.reduce((acc, c) => {
    const price = (c.services as unknown as { price: number } | null)?.price ?? 0
    return acc + Number(price)
  }, 0) ?? 0

  // Taxa de no-show
  const taxaNoShow = totalConsultas
    ? Math.round(((totalFaltou ?? 0) / totalConsultas) * 100)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Métricas</h1>
        <p className="text-sm text-gray-500">Visão geral do seu consultório</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total de pacientes</p>
          <p className="text-2xl font-medium">{totalPacientes ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total de consultas</p>
          <p className="text-2xl font-medium">{totalConsultas ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Consultas realizadas</p>
          <p className="text-2xl font-medium">{totalRealizadas ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Taxa de no-show</p>
          <p className="text-2xl font-medium">{taxaNoShow}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Consultas perdidas</p>
          <p className="text-2xl font-medium">{totalFaltou ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Receita total</p>
          <p className="text-2xl font-medium">
            R$ {receitaTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}