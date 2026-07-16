'use client'
import { useState, useRef, useEffect } from 'react'

const QUADRANTES: { label: string; dentes: number[] }[] = [
  { label: 'Superior direito', dentes: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: 'Superior esquerdo', dentes: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: 'Inferior esquerdo', dentes: [31, 32, 33, 34, 35, 36, 37, 38] },
  { label: 'Inferior direito', dentes: [41, 42, 43, 44, 45, 46, 47, 48] },
]

interface Props {
  value: number[]
  onChange: (dentes: number[]) => void
  label?: string
  inline?: boolean   // quando true, o painel de dentes ocupa espaço (não flutua) — evita ser cortado por overflow:hidden
}

export default function SeletorDentes({ value, onChange, label = 'Dente(s)', inline = false }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', onClickFora)
    return () => document.removeEventListener('mousedown', onClickFora)
  }, [])

  function toggleDente(n: number) {
    if (value.includes(n)) onChange(value.filter(d => d !== n))
    else onChange([...value, n].sort((a, b) => a - b))
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        style={{
          width: '100%', textAlign: 'left', fontSize: 'var(--text-sm)', padding: '8px 12px',
          borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-default)',
          background: 'var(--surface-card)', color: value.length ? 'var(--text-strong)' : 'var(--text-faint, #9ca3af)',
          cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>{value.length > 0 ? `${value.length} dente${value.length > 1 ? 's' : ''}: ${value.join(', ')}` : 'Selecionar dente(s)...'}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 10, transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease' }}>▼</span>
      </button>

      {aberto && (
        <div
          style={inline ? {
            marginTop: 4,
            background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md, 8px)',
            padding: 12, maxHeight: 320, overflowY: 'auto',
          } : {
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50,
            background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md, 8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: 12, maxHeight: 320, overflowY: 'auto',
          }}
        >
          {QUADRANTES.map(q => (
            <div key={q.label} style={{ marginBottom: 10 }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, color: 'var(--text-faint, #9ca3af)', letterSpacing: '0.05em' }}>{q.label.toUpperCase()}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
                {q.dentes.map(n => {
                  const selecionado = value.includes(n)
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleDente(n)}
                      style={{
                        fontSize: 11, padding: '6px 0', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-mono, monospace)',
                        border: `1px solid ${selecionado ? 'var(--brand)' : 'var(--border-default)'}`,
                        background: selecionado ? 'var(--brand)' : 'transparent',
                        color: selecionado ? 'white' : 'var(--text-muted)',
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-600)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  )
}