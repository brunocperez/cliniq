import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PacienteNotes from '@/components/dashboard/PacienteNotes'
import ConsultaNotes from '@/components/dashboard/ConsultaNotes'

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
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/pacientes" className="text-sm hover:opacity-70"
style={{ color: '#0F6E56' }}>← Voltar</Link>
      </div>

      {/* Card do paciente */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-medium text-gray-500">
            {paciente.name ? paciente.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <h1 className="text-lg font-medium">{paciente.name ?? 'Sem nome'}</h1>
            <p className="text-sm text-gray-500">{paciente.phone}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Cadastrado em {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Observações */}
      <PacienteNotes pacienteId={paciente.id} notasIniciais={paciente.notes} />

      {/* Histórico de consultas */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium">Histórico de consultas</h2>
        </div>
        {consultas && consultas.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {consultas.map((consulta) => (
              <div key={consulta.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">
                      {(consulta.services as { name: string } | null)?.name ?? 'Consulta'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    consulta.status === 'confirmado' ? 'bg-green-50 text-green-700' :
                    consulta.status === 'realizado' ? 'bg-blue-50 text-blue-700' :
                    consulta.status === 'faltou' ? 'bg-red-50 text-red-700' :
                    consulta.status === 'cancelado' ? 'bg-gray-100 text-gray-500' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {consulta.status}
                  </span>
                </div>
                <ConsultaNotes consultaId={consulta.id} notasIniciais={consulta.notes} />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-center text-gray-400">
            Nenhuma consulta registrada.
          </p>
        )}
      </div>
    </div>
  )
}