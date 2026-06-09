'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

    // Verifica se todos os blocos necessários estão livres
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
      style={{ background: 'rgba(0,0,0,0.4)' }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-xl border border-gray-200 w-full max-w-3xl max-h-screen overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium">Marcar retorno</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="p-5">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
              {erro}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Serviço do retorno</label>
            <select
              value={servicoId}
              onChange={e => setServicoId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            >
              <option value="">Selecione um serviço (opcional)</option>
              {servicos.map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                const nova = new Date(semanaAtual)
                nova.setDate(nova.getDate() - 7)
                setSemanaAtual(nova)
              }}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              ← Semana anterior
            </button>
            <span className="text-sm text-gray-600">
              {dias[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} –{' '}
              {dias[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const nova = new Date(semanaAtual)
                nova.setDate(nova.getDate() + 7)
                setSemanaAtual(nova)
              }}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Próxima semana →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-16 px-2 py-2 text-gray-400 font-normal text-left">Hora</th>
                  {dias.map((dia, i) => {
                    const hoje = dia.toDateString() === new Date().toDateString()
                    return (
                      <th key={i} className={`px-2 py-2 text-center font-medium ${hoje ? 'text-blue-600' : 'text-gray-600'}`}>
                        <div className="capitalize">{dia.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                        <div className={`w-6 h-6 mx-auto flex items-center justify-center rounded-full ${hoje ? 'bg-blue-600 text-white' : ''}`}>
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
                        <tr key={horario} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 text-gray-400 align-top">{horario}</td>
                            {dias.map((dia, diaIdx) => {
                            const status = blocoDisponivel(dia, horarioIdx)

                            return (
                                <td key={diaIdx} className="px-1 py-1">
                                <button
                                    onClick={() => status === 'disponivel' && !loading && handleAgendar(dia, horario)}
                                    disabled={status !== 'disponivel' || loading}
                                    style={{ height: `${blocosOcupados * 32}px` }}
                                    className={`w-full rounded text-xs transition-colors flex items-center justify-center ${
                                    status === 'ocupado'
                                        ? 'bg-red-50 text-red-400 cursor-not-allowed'
                                        : status === 'passado' || status === 'indisponivel'
                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                                    }`}
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

          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-green-200 inline-block"></span> Disponível</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block"></span> Ocupado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-50 border border-gray-200 inline-block"></span> Passado</span>
          </div>
        </div>
      </div>
    </div>
  )
}