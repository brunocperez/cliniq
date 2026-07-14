'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import PacienteNotes from '@/components/dashboard/PacienteNotes'
import ConsultaNotes from '@/components/dashboard/ConsultaNotes'
import Odontograma from '@/components/dashboard/Odontograma'

type Status = 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'
type Aba = 'resumo' | 'odontograma' | 'historico'

interface Consulta {
  id: string
  scheduled_at: string
  status: string
  notes: string | null
  procedimento_realizado: string | null
  dente_tratado: string | null
  evolucao: string | null
  proximo_passo: string | null
  services: { name: string } | null
}

interface Props {
  paciente: {
    id: string
    name: string | null
    phone: string
    notes: string | null
    created_at: string
    odontograma?: Record<string, unknown>
  }
  consultas: Consulta[]
}

function getIniciais(nome: string | null) {
  if (!nome) return '?'
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function CampoResultado({ label, valor }: { label: string; valor: string | null }) {
  if (!valor) return null
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>{label}: </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-body)' }}>{valor}</span>
    </div>
  )
}

export default function PacienteView({ paciente, consultas }: Props) {
  const [aba, setAba] = useState<Aba>('resumo')

  const consultasRealizadas = consultas.filter(c => c.status === 'realizado')
  const proximasConsultas = consultas.filter(c => ['agendado', 'confirmado'].includes(c.status))

  const abas: { value: Aba; label: string }[] = [
    { value: 'resumo', label: 'Resumo' },
    { value: 'odontograma', label: 'Odontograma' },
    { value: 'historico', label: `Histórico (${consultas.length})` },
  ]

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/pacientes" style={{ fontSize: 'var(--text-sm)', color: 'var(--brand)' }}>← Voltar</Link>
      </div>

      {/* Header do paciente */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--cliniq-50)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
            {getIniciais(paciente.name)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
              {paciente.name ?? 'Sem nome'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{paciente.phone}</p>
          </div>
          <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>{consultas.length}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>consultas</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--brand)' }}>{consultasRealizadas.length}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>realizadas</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--agendado-ink)' }}>{proximasConsultas.length}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>agendadas</p>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: 12 }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
            Cadastrado em {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Segmented control */}
      <div style={{ display: 'flex', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 16, gap: 2, width: 'fit-content' }}>
        {abas.map(a => (
          <button
            key={a.value}
            onClick={() => setAba(a.value)}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-sans)',
              fontWeight: aba === a.value ? 'var(--weight-medium)' : 'var(--weight-regular)',
              background: aba === a.value ? 'var(--surface-card)' : 'transparent',
              color: aba === a.value ? 'var(--text-strong)' : 'var(--text-muted)',
              boxShadow: aba === a.value ? 'var(--shadow-xs)' : 'none',
              transition: 'all 120ms ease',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Aba Resumo */}
      {aba === 'resumo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PacienteNotes pacienteId={paciente.id} notasIniciais={paciente.notes} />

          {proximasConsultas.length > 0 && (
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Próximas consultas</h2>
              </div>
              <div>
                {proximasConsultas.map(c => (
                  <Link key={c.id} href={`/dashboard/agenda/${c.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border-divider)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                        {(c.services as { name: string } | null)?.name ?? 'Consulta'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(c.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <StatusBadge status={c.status as Status} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {consultasRealizadas.length > 0 && (
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Última consulta realizada</h2>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <p style={{ margin: '0 0 8px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {new Date(consultasRealizadas[0].scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  {consultasRealizadas[0].services && ` · ${(consultasRealizadas[0].services as { name: string }).name}`}
                </p>
                <CampoResultado label="Procedimento" valor={consultasRealizadas[0].procedimento_realizado} />
                <CampoResultado label="Dente(s)" valor={consultasRealizadas[0].dente_tratado} />
                <CampoResultado label="Evolução" valor={consultasRealizadas[0].evolucao} />
                <CampoResultado label="Próximo passo" valor={consultasRealizadas[0].proximo_passo} />
                {!consultasRealizadas[0].procedimento_realizado && !consultasRealizadas[0].evolucao && (
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>Nenhum resultado registrado.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {aba === 'odontograma' && (
        <Odontograma
            pacienteId={paciente.id}
                odontogramaInicial={(paciente.odontograma as unknown as Record<string, import('@/components/dashboard/Odontograma').DenteData>) ?? {}}        />
      )}

      {/* Aba Histórico */}
      {aba === 'historico' && (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {consultas.length > 0 ? (
            <div>
              {consultas.map((consulta, idx) => (
                <div key={consulta.id} style={{ padding: '16px 20px', borderBottom: idx < consultas.length - 1 ? '1px solid var(--border-divider)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <Link href={`/dashboard/agenda/${consulta.id}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-strong)')}
                      >
                        {(consulta.services as { name: string } | null)?.name ?? 'Consulta'}
                      </Link>
                      <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(consulta.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <StatusBadge status={consulta.status as Status} />
                  </div>

                  {/* Resultados da consulta */}
                  {(consulta.procedimento_realizado || consulta.dente_tratado || consulta.evolucao || consulta.proximo_passo) && (
                    <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 10 }}>
                      <CampoResultado label="Procedimento" valor={consulta.procedimento_realizado} />
                      <CampoResultado label="Dente(s)" valor={consulta.dente_tratado} />
                      <CampoResultado label="Evolução" valor={consulta.evolucao} />
                      <CampoResultado label="Próximo passo" valor={consulta.proximo_passo} />
                    </div>
                  )}

                  <ConsultaNotes consultaId={consulta.id} notasIniciais={consulta.notes} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ padding: '32px 20px', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-faint)' }}>
              Nenhuma consulta registrada.
            </p>
          )}
        </div>
      )}
    </div>
  )
}