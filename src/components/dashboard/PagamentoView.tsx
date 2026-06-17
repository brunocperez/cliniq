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
  proximo_metodo_pagamento: 'pix' | 'cartao' | 'debito' | null
  proximo_dia_cobranca: number | null
  alteracao_pendente: boolean
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
  { value: 'cartao', label: 'Cartão de crédito', desc: 'Cobrança automática recorrente (em breve)' },
  { value: 'debito', label: 'Débito automático', desc: 'Cobrança direto na conta (em breve)' },
]

const metodoLabel: Record<string, string> = { pix: 'Pix', cartao: 'Cartão de crédito', debito: 'Débito automático' }

const statusInfo: Record<string, { label: string; fill: string; ink: string }> = {
  pendente: { label: 'Pendente', fill: 'var(--agendado-fill)', ink: 'var(--agendado-ink)' },
  pago: { label: 'Pago', fill: 'var(--realizado-fill)', ink: 'var(--realizado-ink)' },
  vencido: { label: 'Vencido', fill: 'var(--faltou-fill)', ink: 'var(--faltou-ink)' },
}

export default function PagamentoView({ tenantId, configInicial, cobrancas }: Props) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState(configInicial?.metodo_pagamento ?? 'pix')
  const [diaCobranca, setDiaCobranca] = useState(configInicial?.dia_cobranca ?? 1)
  const [salvando, setSalvando] = useState(false)

  const metodoAtual = configInicial?.metodo_pagamento ?? 'pix'
  const diaAtual = configInicial?.dia_cobranca ?? 1
  const temAlteracaoPendente = configInicial?.alteracao_pendente

  async function handleSalvar() {
    setSalvando(true)
    const supabase = createClient()

    const mudou = metodoPagamento !== metodoAtual || diaCobranca !== diaAtual

    await supabase
      .from('billing_settings')
      .upsert({
        tenant_id: tenantId,
        metodo_pagamento: metodoAtual,
        dia_cobranca: diaAtual,
        proximo_metodo_pagamento: mudou ? metodoPagamento : null,
        proximo_dia_cobranca: mudou ? diaCobranca : null,
        alteracao_pendente: mudou,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'tenant_id' })

    setSalvando(false)
    setEditando(false)
    router.refresh()
  }

  if (!editando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title="Forma de pagamento atual">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                {metodoLabel[metodoAtual]}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Cobrança todo dia {diaAtual} do mês · R$ 99,00/mês
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditando(true)}>
              Alterar
            </Button>
          </div>

          {temAlteracaoPendente && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--agendado-fill)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--agendado-ink)' }}>
              Você tem uma alteração pendente para <strong>{metodoLabel[configInicial?.proximo_metodo_pagamento ?? '']}</strong>, dia {configInicial?.proximo_dia_cobranca}.
              Ela entrará em vigor após a confirmação do seu próximo pagamento.
            </div>
          )}
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

  return (
    <Card title="Alterar forma de pagamento">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: '10px 14px', background: 'var(--surface-app)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
          A alteração só entrará em vigor após a confirmação do seu próximo pagamento.
        </div>

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
              cursor: m.value === 'pix' ? 'pointer' : 'not-allowed',
              opacity: m.value === 'pix' ? 1 : 0.5,
            }}
          >
            <input
              type="radio"
              name="metodo"
              disabled={m.value !== 'pix'}
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

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button onClick={handleSalvar} disabled={salvando} style={{ flex: 1 }}>
            {salvando ? 'Salvando...' : 'Confirmar alteração'}
          </Button>
          <Button variant="secondary" onClick={() => setEditando(false)} style={{ flex: 1 }}>
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  )
}