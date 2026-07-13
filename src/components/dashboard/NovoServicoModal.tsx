'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { inputStyle, labelStyle } from '@/lib/styles'

interface Props {
  onFechar: () => void
}

export default function NovoServicoModal({ onFechar }: Props) {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [duracao, setDuracao] = useState('60')
  const [preco, setPreco] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCriar() {
    setErro('')

    if (!nome) {
      setErro('O nome do serviço é obrigatório.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single()

    const { error } = await supabase
      .from('services')
      .insert({
        tenant_id: profile?.tenant_id,
        name: nome,
        duration_minutes: parseInt(duracao),
        price: preco ? parseFloat(preco) : null,
      })

    if (error) {
      setErro('Erro ao criar serviço.')
      setLoading(false)
      return
    }

    router.refresh()
    onFechar()
  }

  return (
    <Modal titulo="Novo serviço" onFechar={onFechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
            {erro}
          </div>
        )}

        <div>
          <label style={labelStyle}>Nome do serviço</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Consulta inicial"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Duração (minutos)</label>
            <input
              type="number"
              value={duracao}
              onChange={e => setDuracao(e.target.value)}
              placeholder="60"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Valor (R$)</label>
            <input
              type="number"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              placeholder="150.00"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
          <Button onClick={handleCriar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar serviço'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}