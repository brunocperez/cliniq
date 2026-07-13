import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PacienteView from '@/components/dashboard/PacienteView'

export default async function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: paciente } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!paciente) notFound()

  const { data: consultas } = await supabase
    .from('appointments')
    .select('*, services(name)')
    .eq('patient_id', id)
    .order('scheduled_at', { ascending: false })

  return (
    <PacienteView
      paciente={paciente}
      consultas={consultas ?? []}
    />
  )
}