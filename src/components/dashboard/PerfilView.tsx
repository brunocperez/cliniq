'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import PagamentoView from '@/components/dashboard/PagamentoView'

type Aba = 'dados' | 'pagamento'

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
  nome: string
  iniciais: string
  email: string
  tenantNome: string
  tenantEspecialidade: string
  tenantWhatsapp: string
  responsavelNome: string
  responsavelWhatsapp: string
  tenantId: string
  configPagamento: BillingSettings | null
  cobrancas: Cobranca[]
}

const campo = (label: string, valor: string) => (
  <div>
    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{valor || '—'}</p>
  </div>
)

export default function PerfilView({
  nome, iniciais, email, tenantNome, tenantEspecialidade, tenantWhatsapp,
  responsavelNome, responsavelWhatsapp, tenantId, configPagamento, cobrancas
}: Props) {
  const [aba, setAba] = useState<Aba>('dados')

  const abas: { value: Aba; label: string }[] = [
    { value: 'dados', label: 'Meus dados' },
    { value: 'pagamento', label: 'Pagamento' },
  ]

  return (
    <div className="max-w-lg">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>Perfil</h1>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Suas informações e configurações</p>
      </div>

      {/* Segmented control */}
      <div style={{ display: 'flex', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24, gap: 2, width: 'fit-content' }}>
        {abas.map(a => (
          <button
            key={a.value}
            onClick={() => setAba(a.value)}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-sans)',
              fontWeight: aba === a.value ? 'var(--weight-medium)' : 'var(--weight-regular)',
              background: aba === a.value ? 'var(--surface-card)' : 'transparent',
              color: aba === a.value ? 'var(--text-strong)' : 'var(--text-muted)',
              boxShadow: aba === a.value ? 'var(--shadow-xs)' : 'none',
              transition: 'all 120ms ease',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'dados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--cliniq-50)', color: 'var(--brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'var(--weight-bold)', fontSize: 18,
                flexShrink: 0,
              }}>
                {iniciais || '?'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{nome || '—'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{tenantNome}</p>
              </div>
            </div>
          </Card>

          <Card title="Dados do consultório">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {campo('Nome do consultório', tenantNome)}
              {campo('Especialidade', tenantEspecialidade)}
              {campo('WhatsApp do consultório', tenantWhatsapp)}
            </div>
          </Card>

          <Card title="Dados do responsável">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {campo('Nome do responsável', responsavelNome)}
              {campo('WhatsApp do responsável', responsavelWhatsapp)}
              {campo('E-mail de acesso', email)}
            </div>
          </Card>
        </div>
      )}

      {aba === 'pagamento' && (
        <PagamentoView
          tenantId={tenantId}
          configInicial={configPagamento}
          cobrancas={cobrancas}
        />
      )}
    </div>
  )
}