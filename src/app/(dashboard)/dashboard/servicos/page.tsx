import { createServerSupabaseClient } from '@/lib/supabase/server'
import ServicosView from '@/components/dashboard/ServicosView'

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
      <ServicosView servicos={servicos ?? []} />
    </div>
  )
}