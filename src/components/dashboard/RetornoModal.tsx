'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { inputStyle } from '@/lib/styles'

interface Servico {
  id: string
  name: string
  duration_minutes: number
}

interface Props {
  consultaId: string
  pacienteId: string
  tenantId: string
  onFechar: () => void
}

function getInicioDaSemana(data: Date) {
  const d = new Date(data)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const HORARIOS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

export default function RetornoModal({ consultaId, pacienteId, tenantId, onFechar }: Props) {
  const router = useRouter()

  const [semanaAtual, setSemanaAtual] = useState(getInicioDaSemana(new Date()))
  const [servicos, setServicos] = useState<Servico[]>([])
  const [servicoId, setServicoId] = useState('')
  const [consultasExistentes, setConsultasExistentes] = useState<{ scheduled_at: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semanaAtual)
    d.setDate(d.getDate() + i)
    return d
  })

  const servicoSelecionado = servicos.find(s => s.id === servicoId)
  const duracaoMin = servicoSelecionado?.duration_minutes ?? 30
  const blocosOcupados = Math.ceil(duracaoMin / 30)

  useEffect(() => {
    const supabase = createClient()

    async function carregar() {
      const { data: s } = await supabase
        .from('services')
        .select('id, name, duration_minutes')
        .eq('tenant_id', tenantId)

      setServicos(s ?? [])

      const inicio = semanaAtual.toISOString()
      const fim = new Date(semanaAtual.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: c } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .eq('tenant_id', tenantId)
        .gte('scheduled_at', inicio)
        .lte('scheduled_at', fim)
        .not('status', 'in', '("cancelado","faltou")')

      setConsultasExistentes(c ?? [])
    }
    carregar()
  }, [semanaAtual, tenantId])

  function blocoDisponivel(dia: Date, horarioIdx: number) {
    const [h, m] = HORARIOS[horarioIdx].split(':').map(Number)
    const dtInicio = new Date(dia)
    dtInicio.setHours(h, m, 0, 0)

    if (new Date() > dtInicio) return 'passado'

    for (let b = 0; b < blocosOcupados; b++) {
      const idx = horarioIdx + b
      if (idx >= HORARIOS.length) return 'indisponivel'
      const [hb, mb] = HORARIOS[idx].split(':').map(Number)
      const db = new Date(dia)
      db.setHours(hb, mb, 0, 0)
      const dbFim = new Date(db.getTime() + 30 * 60000)

      const ocupado = consultasExistentes.some(c => {
        const existente = new Date(c.scheduled_at)
        const existenteFim = new Date(existente.getTime() + 60 * 60000)
        return db < existenteFim && dbFim > existente
      })

      if (ocupado) return 'ocupado'
    }

    return 'disponivel'
  }

  async function handleAgendar(dia: Date, horario: string) {
    setErro('')
    setLoading(true)

    const supabase = createClient()
    const [h, m] = horario.split(':').map(Number)
    const dt = new Date(dia)
    dt.setHours(h, m, 0, 0)

    const { error } = await supabase
      .from('appointments')
      .insert({
        tenant_id: tenantId,
        patient_id: pacienteId,
        service_id: servicoId || null,
        scheduled_at: dt.toISOString(),
        status: 'agendado',
        return_of: consultaId,
      })

    if (error) {
      setErro('Erro ao agendar retorno.')
      setLoading(false)
      return
    }

    setLoading(false)
    onFechar()
    router.refresh()
  }

    return (
    <div
      style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={onFechar}
    >
      <div
        style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', width: '100%', maxWidth: 768, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Marcar retorno</h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {erro && (
            <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
              {erro}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Serviço do retorno</label>
            <select value={servicoId} onChange={e => setServicoId(e.target.value)} style={inputStyle}>
              <option value="">Selecione um serviço (opcional)</option>
              {servicos.map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Button variant="secondary" size="sm" onClick={() => { const nova = new Date(semanaAtual); nova.setDate(nova.getDate() - 7); setSemanaAtual(nova) }}>
              ← Semana anterior
            </Button>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
              {dias[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} –{' '}
              {dias[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <Button variant="secondary" size="sm" onClick={() => { const nova = new Date(semanaAtual); nova.setDate(nova.getDate() + 7); setSemanaAtual(nova) }}>
              Próxima semana →
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr>
                  <th style={{ width: 64, padding: '8px', color: 'var(--text-faint)', fontWeight: 'normal', textAlign: 'left' }}>Hora</th>
                  {dias.map((dia, i) => {
                    const hoje = dia.toDateString() === new Date().toDateString()
                    return (
                      <th key={i} style={{ padding: '8px', textAlign: 'center', fontWeight: 'var(--weight-medium)', color: hoje ? 'var(--brand)' : 'var(--text-body)' }}>
                        <div style={{ textTransform: 'capitalize' }}>{dia.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                        <div style={{ width: 24, height: 24, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: hoje ? 'var(--brand)' : 'transparent', color: hoje ? 'white' : 'inherit' }}>
                          {dia.getDate()}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map((horario, horarioIdx) => {
                  if (horarioIdx % blocosOcupados !== 0) return null

                  return (
                    <tr key={horario} style={{ borderTop: '1px solid var(--border-divider)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-faint)', verticalAlign: 'top' }}>{horario}</td>
                      {dias.map((dia, diaIdx) => {
                        const status = blocoDisponivel(dia, horarioIdx)

                        const bgColor = status === 'ocupado'
                          ? 'var(--faltou-fill)'
                          : status === 'disponivel'
                          ? 'var(--realizado-fill)'
                          : 'var(--surface-app)'

                        const textColor = status === 'ocupado'
                          ? 'var(--faltou-ink)'
                          : status === 'disponivel'
                          ? 'var(--realizado-ink)'
                          : 'var(--text-faint)'

                        return (
                          <td key={diaIdx} style={{ padding: '4px' }}>
                            <button
                              onClick={() => status === 'disponivel' && !loading && handleAgendar(dia, horario)}
                              disabled={status !== 'disponivel' || loading}
                              style={{
                                height: `${blocosOcupados * 32}px`,
                                width: '100%',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: bgColor,
                                color: textColor,
                                fontSize: 'var(--text-xs)',
                                cursor: status === 'disponivel' ? 'pointer' : 'not-allowed',
                                fontFamily: 'var(--font-sans)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {status === 'ocupado' ? '✕' : status === 'disponivel' ? `${duracaoMin}min` : '—'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--realizado-fill)', border: '1px solid var(--realizado-ink)', display: 'inline-block' }}></span> Disponível
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--faltou-fill)', border: '1px solid var(--faltou-ink)', display: 'inline-block' }}></span> Ocupado
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--surface-app)', border: '1px solid var(--border-default)', display: 'inline-block' }}></span> Passado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}