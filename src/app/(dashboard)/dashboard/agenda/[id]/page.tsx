import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConsultaActions from '@/components/dashboard/ConsultaActions'
import ConsultaNotes from '@/components/dashboard/ConsultaNotes'
import RetornoButton from '@/components/dashboard/RetornoButton'

export default async function ConsultaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: consulta } = await supabase
    .from('appointments')
    .select('*, patients(id, name, phone), services(name, duration_minutes)')
    .eq('id', id)
    .single()

  if (!consulta) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  // Busca retorno agendado para esta consulta
  const { data: retorno } = await supabase
    .from('appointments')
    .select('*, patients(name), services(name)')
    .eq('return_of', id)
    .single()

  const paciente = consulta.patients as { id: string; name: string; phone: string } | null
  const servico = consulta.services as { name: string; duration_minutes: number } | null

  const statusCores: Record<string, string> = {
    agendado: 'bg-yellow-50 text-yellow-700',
    confirmado: 'bg-green-50 text-green-700',
    realizado: 'bg-blue-50 text-blue-700',
    faltou: 'bg-red-50 text-red-700',
    cancelado: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/dashboard/agenda" className="text-sm text-gray-400 hover:text-gray-600">← Voltar</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-lg font-medium">Detalhes da consulta</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusCores[consulta.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {consulta.status}
          </span>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium mb-4">Informações</h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Paciente</p>
            {paciente ? (
              <Link href={`/dashboard/pacientes/${paciente.id}`} className="text-sm hover:text-blue-600">
                {paciente.name ?? paciente.phone}
              </Link>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Data e hora</p>
            <p className="text-sm">
              {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Serviço</p>
            <p className="text-sm">{servico?.name ?? '—'}</p>
          </div>
          {servico?.duration_minutes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Duração</p>
              <p className="text-sm">{servico.duration_minutes} min</p>
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <ConsultaNotes consultaId={consulta.id} notasIniciais={consulta.notes} />
      </div>

      {/* Retorno */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Retorno</h2>
        </div>
        {retorno ? (
          <Link
            href={`/dashboard/agenda/${retorno.id}`}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div>
              <p className="text-sm font-medium">
                {(retorno.services as { name: string } | null)?.name ?? 'Consulta'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(retorno.scheduled_at).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusCores[retorno.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {retorno.status}
            </span>
          </Link>
        ) : (
          <RetornoButton
            consultaId={consulta.id}
            pacienteId={paciente?.id ?? ''}
            tenantId={profile?.tenant_id ?? ''}
          />
        )}
      </div>

      {/* Ações */}
      {consulta.status !== 'realizado' && consulta.status !== 'cancelado' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4">Atualizar status</h2>
          <ConsultaActions consultaId={consulta.id} statusAtual={consulta.status} />
        </div>
      )}
    </div>
  )
}