import { createServerSupabaseClient } from '@/lib/supabase/server'
import PacientesView from '@/components/dashboard/PacientesView'

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Pacientes</h1>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Gerencie os pacientes do seu consultório</p>
      </div>
      <PacientesView pacientes={pacientes ?? []} />
    </div>
  )
}