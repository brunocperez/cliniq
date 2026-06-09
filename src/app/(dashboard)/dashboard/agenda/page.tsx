import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AgendaView from '@/components/dashboard/AgendaView'

export default async function AgendaPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const { data: consultas } = await supabase
    .from('appointments')
    .select('*, patients(name, phone), services(id, name)')
    .eq('tenant_id', profile?.tenant_id)
    .order('scheduled_at', { ascending: true })

  const { data: servicos } = await supabase
    .from('services')
    .select('id, name')
    .eq('tenant_id', profile?.tenant_id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Agenda</h1>
        <Link
          href="/dashboard/agenda/nova"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Nova consulta
        </Link>
      </div>

      <AgendaView
        consultas={consultas ?? []}
        servicos={servicos ?? []}
      />
    </div>
  )
}