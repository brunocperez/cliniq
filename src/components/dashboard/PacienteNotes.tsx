'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  pacienteId: string
  notasIniciais: string | null
}

export default function PacienteNotes({ pacienteId, notasIniciais }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editando, setEditando] = useState(false)
  const [notas, setNotas] = useState(notasIniciais ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSalvar() {
    setLoading(true)

    await supabase
      .from('patients')
      .update({ notes: notas })
      .eq('id', pacienteId)

    setLoading(false)
    setEditando(false)
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Observações</h2>
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
            rows={4}
            placeholder="Adicione observações sobre o paciente..."
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
          {notas || 'Nenhuma observação registrada.'}
        </p>
      )}
    </div>
  )
}