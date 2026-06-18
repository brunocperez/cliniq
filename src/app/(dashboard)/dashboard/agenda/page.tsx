import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AgendaView from '@/components/dashboard/AgendaView'
import Button from '@/components/ui/Button'

export default async function AgendaPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  // Carrega apenas 3 meses atrás até 3 meses à frente
  const hoje = new Date()
  const inicioJanela = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1).toISOString()
  const fimJanela = new Date(hoje.getFullYear(), hoje.getMonth() + 3, 31).toISOString()

  const [{ data: consultas }, { data: servicos }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, patients(name, phone), services(id, name)')
      .eq('tenant_id', profile?.tenant_id)
      .gte('scheduled_at', inicioJanela)
      .lte('scheduled_at', fimJanela)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('services')
      .select('id, name')
      .eq('tenant_id', profile?.tenant_id),
  ])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Agenda</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Todas as suas consultas</p>
        </div>
        <Link href="/dashboard/agenda/nova">
          <Button>+ Nova consulta</Button>
        </Link>
      </div>

      <AgendaView
        consultas={consultas ?? []}
        servicos={servicos ?? []}
      />
    </div>
  )
}