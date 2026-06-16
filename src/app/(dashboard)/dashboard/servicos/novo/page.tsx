'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function NovoServicoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nome, setNome] = useState('')
  const [duracao, setDuracao] = useState('60')
  const [preco, setPreco] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCriar() {
    setErro('')
    setLoading(true)

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
      setErro(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/servicos')
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
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/dashboard/servicos" className="text-sm hover:opacity-70" style={{ color: '#0F6E56' }}>← Voltar</Link>
        <h1 className="text-lg font-medium mt-2" style={{ color: 'var(--text-strong)' }}>Novo serviço</h1>
      </div>

      <Card>
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

          <Button
            onClick={handleCriar}
            disabled={loading}
            style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? 'Salvando...' : 'Salvar serviço'}
          </Button>
        </div>
      </Card>
    </div>
  )
}