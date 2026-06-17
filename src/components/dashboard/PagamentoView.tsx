'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface BillingSettings {
  id: string
  metodo_pagamento: 'pix' | 'cartao' | 'debito'
  dia_cobranca: number
}

interface Cobranca {
  id: string
  valor: number
  metodo: string
  status: 'pendente' | 'pago' | 'vencido'
  vencimento: string
  pago_em: string | null
  created_at: string
}

interface Props {
  tenantId: string
  configInicial: BillingSettings | null
  cobrancas: Cobranca[]
}

const metodos = [
  { value: 'pix', label: 'Pix', desc: 'QR Code gerado todo mês' },
  { value: 'cartao', label: 'Cartão de crédito', desc: 'Cobrança automática recorrente' },
  { value: 'debito', label: 'Débito automático', desc: 'Cobrança direto na conta' },
]

const statusInfo: Record<string, { label: string; fill: string; ink: string }> = {
  pendente: { label: 'Pendente', fill: 'var(--agendado-fill)', ink: 'var(--agendado-ink)' },
  pago: { label: 'Pago', fill: 'var(--realizado-fill)', ink: 'var(--realizado-ink)' },
  vencido: { label: 'Vencido', fill: 'var(--faltou-fill)', ink: 'var(--faltou-ink)' },
}

export default function PagamentoView({ tenantId, configInicial, cobrancas }: Props) {
  const router = useRouter()
  const [metodoPagamento, setMetodoPagamento] = useState(configInicial?.metodo_pagamento ?? 'pix')
  const [diaCobranca, setDiaCobranca] = useState(configInicial?.dia_cobranca ?? 1)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function handleSalvar() {
    setSalvando(true)
    setSalvo(false)
    const supabase = createClient()

    await supabase
      .from('billing_settings')
      .upsert({
        tenant_id: tenantId,
        metodo_pagamento: metodoPagamento,
        dia_cobranca: diaCobranca,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'tenant_id' })

    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Forma de pagamento">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {metodos.map(m => (
            <label
              key={m.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${metodoPagamento === m.value ? 'var(--brand)' : 'var(--border-default)'}`,
                background: metodoPagamento === m.value ? 'var(--cliniq-50)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="metodo"
                checked={metodoPagamento === m.value}
                onChange={() => setMetodoPagamento(m.value as 'pix' | 'cartao' | 'debito')}
              />
              <div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.desc}</p>
              </div>
            </label>
          ))}

          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
              Dia da cobrança mensal
            </label>
            <select
              value={diaCobranca}
              onChange={e => setDiaCobranca(Number(e.target.value))}
              style={{
                width: '100%',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                background: 'var(--surface-card)',
                color: 'var(--text-body)',
              }}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Dia {d}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleSalvar} disabled={salvando} style={{ marginTop: 8 }}>
            {salvando ? 'Salvando...' : salvo ? 'Salvo ✓' : 'Salvar preferências'}
          </Button>
        </div>
      </Card>

      <Card title="Histórico de cobranças" padded={false}>
        {cobrancas.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {cobrancas.map(c => {
              const info = statusInfo[c.status] ?? statusInfo.pendente
              return (
                <div key={c.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>
                      {Number(c.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Vencimento: {new Date(c.vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', padding: '2px 10px', borderRadius: 'var(--radius-pill)', background: info.fill, color: info.ink }}>
                    {info.label}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ padding: '32px 20px', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-faint)' }}>
            Nenhuma cobrança gerada ainda.
          </p>
        )}
      </Card>
    </div>
  )
}