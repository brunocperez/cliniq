import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConsultaActions from '@/components/dashboard/ConsultaActions'
import ConsultaNotes from '@/components/dashboard/ConsultaNotes'
import RetornoButton from '@/components/dashboard/RetornoButton'
import StatusBadge from '@/components/ui/StatusBadge'
import Card from '@/components/ui/Card'

type Status = 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  if (!valor) return null
  return (
    <div>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{valor}</p>
    </div>
  )
}

export default async function ConsultaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: consulta }, { data: profile }] = await Promise.all([
    supabase.from('appointments').select('*, patients(id, name, phone), services(name, duration_minutes)').eq('id', id).single(),
    supabase.from('profiles').select('tenant_id').single(),
  ])

  if (!consulta) notFound()

  const { data: retorno } = await supabase
    .from('appointments')
    .select('*, patients(name), services(name)')
    .eq('return_of', id)
    .single()

  const paciente = consulta.patients as { id: string; name: string; phone: string } | null
  const servico = consulta.services as { name: string; duration_minutes: number } | null
  const dentesTratados = (consulta.dentes_tratados as number[] | null)?.join(', ') || consulta.dente_tratado
  const temResultado = consulta.procedimento_realizado || dentesTratados || consulta.evolucao || consulta.proximo_passo

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/agenda" style={{ fontSize: 'var(--text-sm)', color: 'var(--brand)' }}>← Voltar</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
            Detalhes da consulta
          </h1>
          <StatusBadge status={consulta.status as Status} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Informações */}
        <Card title="Informações">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Paciente</p>
              {paciente ? (
                <Link href={`/dashboard/pacientes/${paciente.id}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--brand)' }}>
                  {paciente.name ?? paciente.phone}
                </Link>
              ) : (
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-faint)' }}>—</p>
              )}
            </div>
            <Campo label="Data e hora" valor={new Date(consulta.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            <Campo label="Serviço" valor={servico?.name} />
            {servico?.duration_minutes && (
              <Campo label="Duração" valor={`${servico.duration_minutes} min`} />
            )}
          </div>
        </Card>

        {/* Resultado clínico — só aparece se realizado */}
        {consulta.status === 'realizado' && (
          <Card title="Resultado clínico">
            {temResultado ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Campo label="Procedimento realizado" valor={consulta.procedimento_realizado} />
                <Campo label="Dente(s) tratado(s)" valor={dentesTratados} />
                <Campo label="Evolução clínica" valor={consulta.evolucao} />
                <Campo label="Próximo passo" valor={consulta.proximo_passo} />
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-faint)' }}>
                Nenhum resultado registrado para esta consulta.
              </p>
            )}
          </Card>
        )}

        {/* Notas */}
        <Card>
          <ConsultaNotes consultaId={consulta.id} notasIniciais={consulta.notes} />
        </Card>

        {/* Retorno */}
        <Card title="Retorno">
          {retorno ? (
            <Link
              href={`/dashboard/agenda/${retorno.id}`}
              className="group"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                  {(retorno.services as { name: string } | null)?.name ?? 'Consulta'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {new Date(retorno.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
        </Card>

        {/* Atualizar status */}
        {consulta.status !== 'realizado' && consulta.status !== 'cancelado' && (
          <Card title="Atualizar status">
            <ConsultaActions consultaId={consulta.id} statusAtual={consulta.status} />
          </Card>
        )}
      </div>
    </div>
  )
}