'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import {
  STATUS_CONFIG, FACES, type Face, type StatusFace,
} from '@/components/dashboard/OdontogramaDetalheModal'
import { useToast } from '@/components/ui/ToastProvider'

interface Props {
  consultaId: string
  onFechar: () => void
}

// Um "lançamento" = uma marcação de dente feita nesta consulta
interface Lancamento {
  id: string          // id temporário só pra key do React
  dente: number
  face: Face
  status: StatusFace
}

type Modo = 'diagnostico' | 'tratamento'

const inputStyle = {
  width: '100%', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
  padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none',
  boxSizing: 'border-box' as const, color: 'var(--text-body)', background: 'var(--surface-card)',
}
const labelStyle = {
  display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500,
}
const textareaStyle = { ...inputStyle, resize: 'vertical' as const, minHeight: 80 }

// Todos os dentes permanentes, pra popular o seletor de dente de cada lançamento
const TODOS_DENTES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
]

// Cria um snapshot do odontograma do paciente, mas só se houver mudança
// em relação ao último (evita duplicatas idênticas).
async function criarSnapshotSeMudou(
  supabase: ReturnType<typeof createClient>,
  patientId: string,
  consultaId: string,
) {
  const { data: paciente } = await supabase
    .from('patients')
    .select('odontograma')
    .eq('id', patientId)
    .single()
  const odontogramaAtual = paciente?.odontograma ?? {}

  const { data: ultimoSnapshot } = await supabase
    .from('odontograma_snapshots')
    .select('odontograma')
    .eq('patient_id', patientId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  const atualStr = JSON.stringify(odontogramaAtual)
  const ultimoStr = JSON.stringify(ultimoSnapshot?.odontograma ?? null)
  if (ultimoSnapshot && atualStr === ultimoStr) return

  await supabase.from('odontograma_snapshots').insert({
    patient_id: patientId,
    appointment_id: consultaId,
    odontograma: odontogramaAtual,
  })
}

export default function ResultadoConsultaModal({ consultaId, onFechar }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [modo, setModo] = useState<Modo>('diagnostico')
  const [statusPadrao, setStatusPadrao] = useState<StatusFace | ''>('')  // do serviço (status_aplicado)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [procedimento, setProcedimento] = useState('')
  const [evolucao, setEvolucao] = useState('')
  const [proximoPasso, setProximoPasso] = useState('')
  const [loading, setLoading] = useState(false)
  const { mostrarToast } = useToast()

  // Ao abrir, busca a categoria e o status_aplicado do serviço desta consulta
  useEffect(() => {
    let cancelado = false
    async function carregar() {
      const { data } = await supabase
        .from('appointments')
        .select('services(categoria, status_aplicado)')
        .eq('id', consultaId)
        .single()
      if (cancelado) return
      const servico = (data?.services ?? null) as { categoria?: Modo; status_aplicado?: StatusFace | null } | null
      if (servico?.categoria) setModo(servico.categoria)
      if (servico?.status_aplicado) setStatusPadrao(servico.status_aplicado)
    }
    carregar()
    return () => { cancelado = true }
  }, [consultaId, supabase])

  function adicionarLancamento() {
    const novo: Lancamento = {
      id: crypto.randomUUID(),
      dente: 11,
      face: 'oclusal',
      // Em tratamento, se o serviço tem status padrão, já usa; senão, cariado como ponto de partida
      status: (modo === 'tratamento' && statusPadrao) ? statusPadrao : 'cariado',
    }
    setLancamentos(prev => [...prev, novo])
  }

  function atualizarLancamento(id: string, campo: keyof Lancamento, valor: string | number) {
    setLancamentos(prev => prev.map(l => l.id === id ? { ...l, [campo]: valor } : l))
  }

  function removerLancamento(id: string) {
    setLancamentos(prev => prev.filter(l => l.id !== id))
  }

  async function handleSalvar() {
    setLoading(true)

    // 1. Descobre o paciente desta consulta
    const { data: consulta } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('id', consultaId)
      .single()
    const patientId = consulta?.patient_id
    if (!patientId) { setLoading(false); return }

    // 2. Aplica os lançamentos no odontograma do paciente
    if (lancamentos.length > 0) {
      const { data: paciente } = await supabase
        .from('patients')
        .select('odontograma')
        .eq('id', patientId)
        .single()
      const odontograma: Record<string, Record<string, string>> = { ...(paciente?.odontograma ?? {}) }

      for (const l of lancamentos) {
        const denteAtual = { ...(odontograma[l.dente] ?? {}) }
        const valorAnterior = denteAtual[l.face] ?? null
        denteAtual[l.face] = l.status
        odontograma[l.dente] = denteAtual

        // registra no histórico
        await supabase.from('odontograma_historico').insert({
          patient_id: patientId,
          dente: l.dente,
          campo: 'status',
          face: l.face,
          valor_anterior: valorAnterior,
          valor_novo: l.status,
        })
      }

      // salva o odontograma atualizado
      await supabase.from('patients').update({ odontograma }).eq('id', patientId)
    }

    // 3. Atualiza a consulta (marca realizada + campos de texto + dentes tratados)
    const dentesTratados = [...new Set(lancamentos.map(l => l.dente))]
    await supabase
      .from('appointments')
      .update({
        status: 'realizado',
        procedimento_realizado: procedimento || null,
        dentes_tratados: dentesTratados.length > 0 ? dentesTratados : null,
        evolucao: evolucao || null,
        proximo_passo: proximoPasso || null,
      })
      .eq('id', consultaId)

    // 4. Cria snapshot (depois de aplicar tudo)
    await criarSnapshotSeMudou(supabase, patientId, consultaId)

    mostrarToast('Consulta finalizada com sucesso.', 'sucesso')
    setLoading(false)
    router.refresh()
    onFechar()
  }

  async function handlePular() {
    setLoading(true)
    await supabase.from('appointments').update({ status: 'realizado' }).eq('id', consultaId)
    setLoading(false)
    router.refresh()
    onFechar()
  }

  const corModo = modo === 'diagnostico' ? '#dc2626' : '#16a34a'

  return (
    <Modal titulo="Registrar resultado da consulta" onFechar={onFechar} largura={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Alternador de modo */}
        <div>
          <label style={labelStyle}>Tipo de registro</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { value: 'diagnostico' as const, label: 'Diagnóstico', desc: 'Marcar problemas encontrados' },
              { value: 'tratamento' as const, label: 'Tratamento', desc: 'Registrar o que foi feito' },
            ]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setModo(opt.value)}
                style={{
                  flex: 1, textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${modo === opt.value ? corModo : 'var(--border-default)'}`,
                  background: modo === opt.value ? (opt.value === 'diagnostico' ? '#fef2f2' : '#f0fdf4') : 'var(--surface-card)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: modo === opt.value ? corModo : 'var(--text-strong)' }}>{opt.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de lançamentos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Dentes {modo === 'diagnostico' ? 'com problema' : 'tratados'}</label>
            <button
              type="button"
              onClick={adicionarLancamento}
              style={{
                fontSize: 'var(--text-xs)', padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                border: `1px solid ${corModo}`, background: 'transparent', color: corModo, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              + Adicionar dente
            </button>
          </div>

          {lancamentos.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', padding: '8px 0' }}>
              Nenhum dente adicionado. Clique em &quot;+ Adicionar dente&quot; para marcar.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lancamentos.map(l => (
                <div key={l.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {/* Dente */}
                  <select value={l.dente} onChange={e => atualizarLancamento(l.id, 'dente', Number(e.target.value))} style={{ ...inputStyle, width: 80, padding: '6px 8px' }}>
                    {TODOS_DENTES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {/* Face */}
                  <select value={l.face} onChange={e => atualizarLancamento(l.id, 'face', e.target.value)} style={{ ...inputStyle, flex: 1, padding: '6px 8px' }}>
                    {FACES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                  {/* Status */}
                  <select value={l.status} onChange={e => atualizarLancamento(l.id, 'status', e.target.value)} style={{ ...inputStyle, flex: 1, padding: '6px 8px' }}>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                  </select>
                  {/* Remover */}
                  <button
                    type="button"
                    onClick={() => removerLancamento(l.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campos de texto (comuns aos dois modos) */}
        <div>
          <label style={labelStyle}>Procedimento realizado</label>
          <input type="text" value={procedimento} onChange={e => setProcedimento(e.target.value)} placeholder="Ex: Restauração classe II, Canal molar..." style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Evolução clínica</label>
          <textarea value={evolucao} onChange={e => setEvolucao(e.target.value)} placeholder="Evolução, intercorrências, materiais..." style={textareaStyle} />
        </div>

        <div>
          <label style={labelStyle}>Próximo passo (opcional)</label>
          <input type="text" value={proximoPasso} onChange={e => setProximoPasso(e.target.value)} placeholder="Ex: Retorno em 15 dias" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
          <Button variant="ghost" size="sm" onClick={handlePular} disabled={loading}>
            Pular e marcar como realizado
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={onFechar} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar resultado'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}