'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  consultaId: string
  statusAtual: string
}

const acoes = [
  { status: 'confirmado', label: 'Confirmar', fill: 'var(--confirmado-fill)', ink: 'var(--confirmado-ink)', somente: ['agendado'] },
  { status: 'realizado', label: 'Realizado', fill: 'var(--realizado-fill)', ink: 'var(--realizado-ink)', somente: null },
  { status: 'faltou', label: 'Faltou', fill: 'var(--faltou-fill)', ink: 'var(--faltou-ink)', somente: null },
  { status: 'cancelado', label: 'Cancelar', fill: 'var(--cancelado-fill)', ink: 'var(--cancelado-ink)', somente: null },
]

export default function ConsultaActions({ consultaId, statusAtual }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleStatus(novoStatus: string) {
    await supabase
      .from('appointments')
      .update({ status: novoStatus })
      .eq('id', consultaId)

    router.refresh()
  }

  if (statusAtual === 'realizado' || statusAtual === 'cancelado') {
    return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>—</span>
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {acoes.map(acao => {
        if (acao.somente && !acao.somente.includes(statusAtual)) return null
        return (
          <button
            key={acao.status}
            onClick={() => handleStatus(acao.status)}
            style={{
              fontSize: 'var(--text-xs)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${acao.ink}33`,
              background: acao.fill,
              color: acao.ink,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {acao.label}
          </button>
        )
      })}
    </div>
  )
}