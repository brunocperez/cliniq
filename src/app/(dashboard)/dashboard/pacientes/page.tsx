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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Pacientes</h1>
      </div>
      <PacientesView pacientes={pacientes ?? []} />
    </div>
  )
}