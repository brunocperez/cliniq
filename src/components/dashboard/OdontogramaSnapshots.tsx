'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import type { DenteData } from '@/components/dashboard/Odontograma'
import {
  TOOTH_SHAPES, IMG_W, IMG_H, IMAGEM_BASE, SEVERIDADE_COR, calcularSeveridade,
} from '@/components/dashboard/Odontograma'
import { STATUS_CONFIG, FACES, type Face, type StatusFace } from '@/components/dashboard/OdontogramaDetalheModal'

interface Snapshot {
  id: string
  odontograma: Record<string, DenteData>
  criado_em: string
}

interface Props {
  pacienteId: string
}

const FACE_LABEL: Record<Face, string> = {
  oclusal: 'Oclusal', mesial: 'Mesial', distal: 'Distal', vestibular: 'Vestibular', lingual: 'Lingual',
}

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
          return <polygon key={t.numero} points={t.points} fill={SEVERIDADE_COR[severidade]} opacity={ausente ? 0.3 : 0.55} style={{ mixBlendMode: 'multiply' }} />
        })}
      </svg>
    </div>
  )
}

// Compara dois snapshots e devolve a lista de mudanças por dente/face
interface Diff {
  dente: number
  face: Face
  de: string
  para: string
}

function calcularDiff(antes: Record<string, DenteData>, depois: Record<string, DenteData>): Diff[] {
  const diffs: Diff[] = []
  for (const t of TOOTH_SHAPES) {
    const dA = antes[t.numero] ?? {}
    const dD = depois[t.numero] ?? {}
    for (const face of FACES) {
      const vA = dA[face]
      const vD = dD[face]
      if (vA !== vD) {
        diffs.push({
          dente: t.numero,
          face,
          de: vA ? STATUS_CONFIG[vA as StatusFace].label : '—',
          para: vD ? STATUS_CONFIG[vD as StatusFace].label : '—',
        })
      }
    }
  }
  return diffs
}

export default function OdontogramaSnapshots({ pacienteId }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [idEsquerda, setIdEsquerda] = useState<string>('')
  const [idDireita, setIdDireita] = useState<string>('')

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
  const diffs = (snapEsquerda && snapDireita) ? calcularDiff(snapEsquerda.odontograma, snapDireita.odontograma) : []

  const selectStyle = {
    fontSize: 'var(--text-sm)', padding: '6px 10px', borderRadius: 'var(--radius-md, 6px)',
    border: '1px solid var(--border-default)', fontFamily: 'var(--font-sans)',
    background: 'var(--surface-card)', color: 'var(--text-strong)', width: '100%',
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginTop: 16 }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Evolução do odontograma</h2>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {carregando ? 'Carregando...' : `${snapshots.length} registro${snapshots.length !== 1 ? 's' : ''} salvos ao longo das consultas`}
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          disabled={snapshots.length < 2}
          style={{
            fontSize: 'var(--text-xs)', padding: '8px 16px', borderRadius: 'var(--radius-pill)',
            border: 'none', background: snapshots.length < 2 ? 'var(--surface-sunken)' : 'var(--brand)',
            color: snapshots.length < 2 ? 'var(--text-faint)' : 'white',
            cursor: snapshots.length < 2 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
          }}
        >
          Comparar evolução
        </button>
      </div>

      {snapshots.length < 2 && !carregando && (
        <p style={{ padding: '0 20px 16px', fontSize: 'var(--text-xs)', color: 'var(--text-faint)', margin: 0 }}>
          É preciso ter ao menos 2 registros para comparar. Eles são criados automaticamente ao finalizar consultas.
        </p>
      )}

      {modalAberto && snapEsquerda && snapDireita && (
        <Modal titulo="Comparar evolução do odontograma" onFechar={() => setModalAberto(false)} largura={900}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Dois odontogramas lado a lado */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <select value={idEsquerda} onChange={e => setIdEsquerda(e.target.value)} style={{ ...selectStyle, marginBottom: 10 }}>
                  {snapshots.map(s => <option key={s.id} value={s.id}>{formatarData(s.criado_em)}</option>)}
                </select>
                <MiniOdontograma odontograma={snapEsquerda.odontograma} />
              </div>
              <div style={{ flex: 1, minWidth: 300 }}>
                <select value={idDireita} onChange={e => setIdDireita(e.target.value)} style={{ ...selectStyle, marginBottom: 10 }}>
                  {snapshots.map(s => <option key={s.id} value={s.id}>{formatarData(s.criado_em)}</option>)}
                </select>
                <MiniOdontograma odontograma={snapDireita.odontograma} />
              </div>
            </div>

            {/* Resumo das diferenças */}
            <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                Mudanças entre as duas datas
              </h3>
              {diffs.length === 0 ? (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>Nenhuma diferença entre os dois registros.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {diffs.map((d, i) => (
                    <div key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-strong)', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, minWidth: 54 }}>Dente {d.dente}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{FACE_LABEL[d.face]}:</span>
                      <span>{d.de}</span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span style={{ fontWeight: 500 }}>{d.para}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}