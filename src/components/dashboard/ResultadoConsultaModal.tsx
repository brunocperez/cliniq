'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

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

export default function ResultadoConsultaModal({ consultaId, onFechar }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [procedimento, setProcedimento] = useState('')
  const [dente, setDente] = useState('')
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
        dente_tratado: dente || null,
        evolucao: evolucao || null,
        proximo_passo: proximoPasso || null,
      })
      .eq('id', consultaId)

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
          <label style={labelStyle}>Dente(s) tratado(s)</label>
          <input
            type="text"
            value={dente}
            onChange={e => setDente(e.target.value)}
            placeholder="Ex: 36, 37 — ou região: arco superior"
            style={inputStyle}
          />
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
            Em breve: odontograma visual com seleção por IA 🦷
          </p>
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