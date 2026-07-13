'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import PhoneInput from '@/components/ui/PhoneInput'

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
}

interface Props {
  onFechar: () => void
}

export default function NovoPacienteModal({ onFechar }: Props) {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCriar() {
    setErro('')

    if (!telefone) {
      setErro('O WhatsApp é obrigatório.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single()

    const { error } = await supabase
      .from('patients')
      .insert({
        tenant_id: profile?.tenant_id,
        name: nome || null,
        phone: telefone,
      })

    if (error) {
      setErro('Erro ao cadastrar paciente.')
      setLoading(false)
      return
    }

    router.refresh()
    onFechar()
  }

  return (
    <Modal titulo="Novo paciente" onFechar={onFechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
            {erro}
          </div>
        )}

        <div>
          <label style={labelStyle}>Nome (opcional)</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: João Silva"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>WhatsApp</label>
          <PhoneInput value={telefone} onChange={setTelefone} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
          <Button onClick={handleCriar} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar paciente'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}