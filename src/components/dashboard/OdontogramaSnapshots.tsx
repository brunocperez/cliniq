'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DenteData } from '@/components/dashboard/Odontograma'
import {
  TOOTH_SHAPES, IMG_W, IMG_H, IMAGEM_BASE, SEVERIDADE_COR, calcularSeveridade,
} from '@/components/dashboard/Odontograma'

interface Snapshot {
  id: string
  odontograma: Record<string, DenteData>
  criado_em: string
}

interface Props {
  pacienteId: string
}

// Desenha um odontograma (imagem-base + dentes coloridos) como SVG.
// Reaproveita os contornos e a regra de cor do componente principal.
function MiniOdontograma({ odontograma }: { odontograma: Record<string, DenteData> }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMAGEM_BASE} alt="" className="odontograma-img" style={{ width: '100%', display: 'block' }} draggable={false} />
      <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {TOOTH_SHAPES.map(t => {
          const data = odontograma[t.numero]
          if (!data) return null
          const severidade = calcularSeveridade(data)
          if (!severidade) return null
          const ausente = data.oclusal === 'ausente' || data.mesial === 'ausente' || data.vestibular === 'ausente'
          return (
            <polygon
              key={t.numero}
              points={t.points}
              fill={SEVERIDADE_COR[severidade]}
              opacity={ausente ? 0.3 : 0.55}
              style={{ mixBlendMode: 'multiply' }}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default function OdontogramaSnapshots({ pacienteId }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [carregando, setCarregando] = useState(true)
  const [idEsquerda, setIdEsquerda] = useState<string>('')
  const [idDireita, setIdDireita] = useState<string>('')
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('odontograma_snapshots')
        .select('id, odontograma, criado_em')
        .eq('patient_id', pacienteId)
        .order('criado_em', { ascending: false })
      if (!cancelado && data) {
        setSnapshots(data as Snapshot[])
        // Pré-seleciona: direita = mais recente, esquerda = mais antigo
        if (data.length >= 2) {
          setIdDireita(data[0].id)
          setIdEsquerda(data[data.length - 1].id)
        }
      }
      if (!cancelado) setCarregando(false)
    }
    carregar()
    return () => { cancelado = true }
  }, [pacienteId])

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const snapEsquerda = snapshots.find(s => s.id === idEsquerda)
  const snapDireita = snapshots.find(s => s.id === idDireita)

  const selectStyle = {
    fontSize: 'var(--text-xs)', padding: '4px 8px', borderRadius: 'var(--radius-md, 6px)',
    border: '1px solid var(--border-default)', fontFamily: 'var(--font-sans)',
    background: 'var(--surface-card)', color: 'var(--text-strong)',
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginTop: 16 }}>
      {/* Cabeçalho retrátil */}
      <button
        onClick={() => setAberto(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
          background: 'none', border: 'none', cursor: 'pointer', padding: '14px 20px',
          fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)', fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ transform: aberto ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease', fontSize: 10, color: 'var(--text-muted)' }}>▶</span>
        Comparar evolução {snapshots.length > 0 && `(${snapshots.length} registros)`}
      </button>

      {aberto && (
        <div style={{ padding: '0 20px 20px' }}>
          {carregando ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Carregando...</p>
          ) : snapshots.length < 2 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              É preciso ter pelo menos 2 registros para comparar. Os registros são criados automaticamente ao finalizar consultas.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {/* Coluna esquerda */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <select value={idEsquerda} onChange={e => setIdEsquerda(e.target.value)} style={{ ...selectStyle, marginBottom: 8, width: '100%' }}>
                  {snapshots.map(s => (
                    <option key={s.id} value={s.id}>{formatarData(s.criado_em)}</option>
                  ))}
                </select>
                {snapEsquerda && <MiniOdontograma odontograma={snapEsquerda.odontograma} />}
              </div>

              {/* Coluna direita */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <select value={idDireita} onChange={e => setIdDireita(e.target.value)} style={{ ...selectStyle, marginBottom: 8, width: '100%' }}>
                  {snapshots.map(s => (
                    <option key={s.id} value={s.id}>{formatarData(s.criado_em)}</option>
                  ))}
                </select>
                {snapDireita && <MiniOdontograma odontograma={snapDireita.odontograma} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}