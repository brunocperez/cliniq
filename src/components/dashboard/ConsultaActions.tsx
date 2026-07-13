'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResultadoConsultaModal from '@/components/dashboard/ResultadoConsultaModal'

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
  const [loading, setLoading] = useState<string | null>(null)
  const [mostrarModalResultado, setMostrarModalResultado] = useState(false)

  async function handleStatus(novoStatus: string) {
    if (novoStatus === 'realizado') {
      setMostrarModalResultado(true)
      return
    }

    setLoading(novoStatus)
    await supabase
      .from('appointments')
      .update({ status: novoStatus })
      .eq('id', consultaId)
    router.refresh()
    setLoading(null)
  }

  if (statusAtual === 'realizado' || statusAtual === 'cancelado') {
    return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>—</span>
  }

  return (
    <>
      {mostrarModalResultado && (
        <ResultadoConsultaModal
          consultaId={consultaId}
          onFechar={() => setMostrarModalResultado(false)}
        />
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {acoes.map(acao => {
          if (acao.somente && !acao.somente.includes(statusAtual)) return null
          const isLoading = loading === acao.status
          return (
            <button
              key={acao.status}
              onClick={() => handleStatus(acao.status)}
              disabled={loading !== null}
              style={{
                fontSize: 'var(--text-xs)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${acao.ink}33`,
                background: acao.fill,
                color: acao.ink,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
                opacity: loading !== null && !isLoading ? 0.4 : 1,
                transition: 'opacity 120ms ease',
                minWidth: 70,
              }}
            >
              {isLoading ? '...' : acao.label}
            </button>
          )
        })}
      </div>
    </>
  )
}