'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import SeletorDentes from '@/components/dashboard/SeletorDentes'


interface Props {
  consultaId: string
  onFechar: () => void
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  color: 'var(--text-body)',
  background: 'var(--surface-card)',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-muted)',
  marginBottom: 4,
  fontWeight: 500,
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: 80,
}

// Cria um snapshot do odontograma do paciente, mas só se houver mudança
// em relação ao último snapshot (evita duplicatas idênticas).
async function criarSnapshotSeMudou(
  supabase: ReturnType<typeof createClient>,
  consultaId: string,
) {
  // 1. Descobre de qual paciente é esta consulta
  const { data: consulta } = await supabase
    .from('appointments')
    .select('patient_id')
    .eq('id', consultaId)
    .single()
  if (!consulta?.patient_id) return
  const patientId = consulta.patient_id

  // 2. Pega o odontograma atual do paciente
  const { data: paciente } = await supabase
    .from('patients')
    .select('odontograma')
    .eq('id', patientId)
    .single()
  const odontogramaAtual = paciente?.odontograma ?? {}

  // 3. Pega o último snapshot pra comparar
  const { data: ultimoSnapshot } = await supabase
    .from('odontograma_snapshots')
    .select('odontograma')
    .eq('patient_id', patientId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 4. Se o estado atual é igual ao último snapshot, não cria outro
  const atualStr = JSON.stringify(odontogramaAtual)
  const ultimoStr = JSON.stringify(ultimoSnapshot?.odontograma ?? null)
  if (ultimoSnapshot && atualStr === ultimoStr) return

  // 5. Cria o snapshot novo
  await supabase.from('odontograma_snapshots').insert({
    patient_id: patientId,
    appointment_id: consultaId,
    odontograma: odontogramaAtual,
  })
}

export default function ResultadoConsultaModal({ consultaId, onFechar }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [procedimento, setProcedimento] = useState('')
  const [dentesTratados, setDentesTratados] = useState<number[]>([])
  const [evolucao, setEvolucao] = useState('')
  const [proximoPasso, setProximoPasso] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSalvar() {
    setLoading(true)

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

    await criarSnapshotSeMudou(supabase, consultaId)

    setLoading(false)
    router.refresh()
    onFechar()
  }

  async function handlePular() {
    setLoading(true)
    await supabase
      .from('appointments')
      .update({ status: 'realizado' })
      .eq('id', consultaId)
    setLoading(false)
    router.refresh()
    onFechar()
  }

  return (
    <Modal titulo="Registrar resultado da consulta" onFechar={onFechar} largura={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--cliniq-50)', border: '1px solid var(--cliniq-200)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-xs)', color: 'var(--brand)' }}>
          Registre o que foi feito nesta consulta. As informações ficam no histórico do paciente.
        </div>

        <div>
          <label style={labelStyle}>Procedimento realizado</label>
          <input
            type="text"
            value={procedimento}
            onChange={e => setProcedimento(e.target.value)}
            placeholder="Ex: Restauração classe II, Canal molar..."
            style={inputStyle}
          />
        </div>

        <div>
          <SeletorDentes value={dentesTratados} onChange={setDentesTratados} label="Dente(s) tratado(s)" />
        </div>

        <div>
          <label style={labelStyle}>Evolução clínica</label>
          <textarea
            value={evolucao}
            onChange={e => setEvolucao(e.target.value)}
            placeholder="Descreva a evolução do tratamento, intercorrências, materiais utilizados..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Próximo passo (opcional)</label>
          <input
            type="text"
            value={proximoPasso}
            onChange={e => setProximoPasso(e.target.value)}
            placeholder="Ex: Retorno em 15 dias para cimentação da coroa"
            style={inputStyle}
          />
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