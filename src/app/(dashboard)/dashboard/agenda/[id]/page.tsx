import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConsultaActions from '@/components/dashboard/ConsultaActions'
import ConsultaNotes from '@/components/dashboard/ConsultaNotes'
import RetornoButton from '@/components/dashboard/RetornoButton'
import StatusBadge from '@/components/ui/StatusBadge'

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

  const { data: retorno } = await supabase
    .from('appointments')
    .select('*, patients(name), services(name)')
    .eq('return_of', id)
    .single()

  const paciente = consulta.patients as { id: string; name: string; phone: string } | null
  const servico = consulta.services as { name: string; duration_minutes: number } | null

  type Status = 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/dashboard/agenda" className="text-sm hover:opacity-70" style={{ color: '#0F6E56' }}>← Voltar</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-lg font-medium">Detalhes da consulta</h1>
          <StatusBadge status={consulta.status as Status} />
        </div>
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium mb-4">Informações</h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Paciente</p>
            {paciente ? (
              <Link href={`/dashboard/pacientes/${paciente.id}`} className="text-sm hover:opacity-70" style={{ color: '#0F6E56' }}>
                {paciente.name ?? paciente.phone}
              </Link>
            ) : (
              <p className="text-sm text-[var(--text-faint)]">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Data e hora</p>
            <p className="text-sm">
              {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Serviço</p>
            <p className="text-sm">{servico?.name ?? '—'}</p>
          </div>
          {servico?.duration_minutes && (
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Duração</p>
              <p className="text-sm">{servico.duration_minutes} min</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-6 mb-4">
        <ConsultaNotes consultaId={consulta.id} notasIniciais={consulta.notes} />
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Retorno</h2>
        </div>
        {retorno ? (
          <Link
            href={`/dashboard/agenda/${retorno.id}`}
            className="flex items-center justify-between p-3 bg-[var(--surface-app)] rounded-lg hover:bg-[var(--surface-sunken)]"
          >
            <div>
              <p className="text-sm font-medium">
                {(retorno.services as { name: string } | null)?.name ?? 'Consulta'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {new Date(retorno.scheduled_at).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <StatusBadge status={retorno.status as Status} />
          </Link>
        ) : (
          <RetornoButton
            consultaId={consulta.id}
            pacienteId={paciente?.id ?? ''}
            tenantId={profile?.tenant_id ?? ''}
          />
        )}
      </div>

      {consulta.status !== 'realizado' && consulta.status !== 'cancelado' && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4">Atualizar status</h2>
          <ConsultaActions consultaId={consulta.id} statusAtual={consulta.status} />
        </div>
      )}
    </div>
  )
}