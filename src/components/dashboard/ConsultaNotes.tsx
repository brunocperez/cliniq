'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  consultaId: string
  notasIniciais: string | null
}

export default function ConsultaNotes({ consultaId, notasIniciais }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editando, setEditando] = useState(false)
  const [notas, setNotas] = useState(notasIniciais ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSalvar() {
    setLoading(true)

    await supabase
      .from('appointments')
      .update({ notes: notas })
      .eq('id', consultaId)

    setLoading(false)
    setEditando(false)
    router.refresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Notas</p>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-body)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {notas ? 'Editar' : '+ Adicionar'}
          </button>
        )}
      </div>

      {editando ? (
        <div>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={3}
            placeholder="Anotações da consulta..."
            style={{
              width: '100%',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
              color: 'var(--text-body)',
              background: 'var(--surface-card)',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button onClick={handleSalvar} disabled={loading} size="sm">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setEditando(false); setNotas(notasIniciais ?? '') }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {notas || 'Nenhuma nota registrada.'}
        </p>
      )}
    </div>
  )
}