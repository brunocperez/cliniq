'use client'
import { useEffect, useState } from 'react'

export type StatusFace = 'higido' | 'cariado' | 'restaurado' | 'ausente' | 'implante' | 'canal'
export type Face = 'oclusal' | 'mesial' | 'distal' | 'vestibular' | 'lingual'

export interface DenteData {
  oclusal?: StatusFace
  mesial?: StatusFace
  distal?: StatusFace
  vestibular?: StatusFace
  lingual?: StatusFace
  nota?: string
}

export const STATUS_CONFIG: Record<StatusFace, { label: string; cor: string }> = {
  higido:     { label: 'Hígido',     cor: '#16a34a' },
  cariado:    { label: 'Cariado',    cor: '#dc2626' },
  restaurado: { label: 'Restaurado', cor: '#2563eb' },
  ausente:    { label: 'Ausente',    cor: '#9ca3af' },
  implante:   { label: 'Implante',   cor: '#7c3aed' },
  canal:      { label: 'Canal',      cor: '#ea580c' },
}

export const FACES: Face[] = ['oclusal', 'mesial', 'distal', 'vestibular', 'lingual']

export interface HistoricoItem {
  id: string
  dente: number
  campo: 'status' | 'nota'
  face: Face | null
  valor_anterior: string | null
  valor_novo: string | null
  criado_em: string
}

interface Props {
  numero: number
  data: DenteData
  faceSelecionada: Face | null
  salvando: boolean
  onSelecionarFace: (face: Face) => void
  onSelecionarStatus: (status: StatusFace) => void
  onLimparFace: () => void
  onLimparDente: () => void
  onSalvarNota: (nota: string) => void
  onFechar: () => void
  historico: HistoricoItem[]
  carregandoHistorico: boolean
}

// Diagrama quadrado do dente (mesmo design validado da primeira versão),
// agora ampliado e com rótulos das faces ao redor pra ficar autoexplicativo.
function DenteQuadradoGrande({
  data, faceSelecionada, onClickFace,
}: {
  data: DenteData
  faceSelecionada: Face | null
  onClickFace: (face: Face) => void
}) {
  const S = 180
  const M = 40

  function corFace(face: Face) {
    const status = data[face]
    return status ? STATUS_CONFIG[status].cor : '#F9FAFB'
  }
  function opacidade(face: Face) {
    return data[face] ? 1 : 0.3
  }

  const regioes: { face: Face; points: string }[] = [
    { face: 'vestibular', points: `0,0 ${S},0 ${S - M},${M} ${M},${M}` },
    { face: 'lingual', points: `${M},${S - M} ${S - M},${S - M} ${S},${S} 0,${S}` },
    { face: 'mesial', points: `0,0 ${M},${M} ${M},${S - M} 0,${S}` },
    { face: 'distal', points: `${S - M},${M} ${S},0 ${S},${S} ${S - M},${S - M}` },
  ]

  return (
    <div style={{ position: 'relative', width: S + 100, height: S + 100, margin: '0 auto' }}>
      {/* Rótulos ao redor */}
      <span style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>VESTIBULAR</span>
      <span style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>LINGUAL</span>
      <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>MESIAL</span>
      <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>DISTAL</span>

      <svg
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ position: 'absolute', top: 50, left: 50 }}
      >
        {regioes.map(({ face, points }) => (
          <polygon
            key={face}
            points={points}
            fill={corFace(face)}
            stroke="white"
            strokeWidth={2}
            opacity={opacidade(face)}
            style={{ cursor: 'pointer' }}
            onClick={() => onClickFace(face)}
          />
        ))}
        <rect
          x={M} y={M} width={S - 2 * M} height={S - 2 * M}
          fill={corFace('oclusal')}
          stroke="white"
          strokeWidth={2}
          opacity={opacidade('oclusal')}
          style={{ cursor: 'pointer' }}
          onClick={() => onClickFace('oclusal')}
        />
        <text x={S / 2} y={S / 2 + 4} textAnchor="middle" fontSize={11} fill="var(--text-muted)" style={{ pointerEvents: 'none' }}>OCLUSAL</text>

        {(['vestibular', 'lingual', 'mesial', 'distal'] as Face[]).map(face =>
          faceSelecionada === face ? (
            <polygon key={`sel-${face}`} points={regioes.find(r => r.face === face)!.points} fill="none" stroke="var(--brand)" strokeWidth={3} />
          ) : null
        )}
        {faceSelecionada === 'oclusal' && (
          <rect x={M} y={M} width={S - 2 * M} height={S - 2 * M} fill="none" stroke="var(--brand)" strokeWidth={3} />
        )}
      </svg>
    </div>
  )
}

const FACE_LABEL_HIST: Record<Face, string> = {
  oclusal: 'Oclusal', mesial: 'Mesial', distal: 'Distal', vestibular: 'Vestibular', lingual: 'Lingual',
}

function formatarValorHistorico(campo: 'status' | 'nota', valor: string | null): string {
  if (valor === null) return '—'
  if (campo === 'status') return STATUS_CONFIG[valor as StatusFace]?.label ?? valor
  return valor.length > 40 ? valor.slice(0, 40) + '…' : valor
}

export default function OdontogramaDetalheModal({
  numero, data, faceSelecionada, salvando,
  onSelecionarFace, onSelecionarStatus, onLimparFace, onLimparDente, onSalvarNota, onFechar,
  historico, carregandoHistorico,
}: Props) {
  const [notaDraft, setNotaDraft] = useState(data.nota ?? '')
  const [historicoAberto, setHistoricoAberto] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onFechar])

  const statusFaceAtual = faceSelecionada ? data[faceSelecionada] : null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={onFechar}
    >
      <div
        style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Dente {numero}</h2>
            {faceSelecionada && <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Face selecionada: {faceSelecionada}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {salvando && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Salvando...</span>}
            <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: 'var(--text-muted)' }}>×</button>
          </div>
        </div>

        {/* Diagrama */}
        <div style={{ padding: '24px 20px 8px' }}>
          <DenteQuadradoGrande data={data} faceSelecionada={faceSelecionada} onClickFace={onSelecionarFace} />
          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '8px 0 0' }}>
            Clique em uma face do desenho, ou use os botões abaixo
          </p>
        </div>

        {/* Nota geral do dente */}
        <div style={{ padding: '0 20px 16px' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Nota do dente
          </label>
          <textarea
            value={notaDraft}
            onChange={e => setNotaDraft(e.target.value)}
            placeholder="Ex: cárie profunda, avaliar necessidade de canal"
            rows={2}
            style={{
              width: '100%',
              fontSize: 'var(--text-xs)',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md, 6px)',
              border: '1px solid var(--border-default)',
              fontFamily: 'var(--font-sans)',
              resize: 'vertical',
              color: 'var(--text-strong)',
              background: 'var(--surface-card)',
            }}
          />
          {notaDraft !== (data.nota ?? '') && (
            <button
              onClick={() => onSalvarNota(notaDraft)}
              style={{
                marginTop: 6,
                fontSize: 'var(--text-xs)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--brand)',
                background: 'var(--brand)',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Salvar nota
            </button>
          )}
        </div>

        {/* Seletor de face */}
        <div style={{ padding: '4px 20px', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {FACES.map(face => (
            <button
              key={face}
              onClick={() => onSelecionarFace(face)}
              style={{
                fontSize: 'var(--text-xs)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-default)',
                background: faceSelecionada === face ? 'var(--brand)' : 'var(--surface-card)',
                color: faceSelecionada === face ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
              }}
            >
              {face}
            </button>
          ))}
        </div>

        {/* Seletor de status */}
        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border-divider)', marginTop: 16, background: 'var(--surface-sunken)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Status</span>
            <button
              onClick={onLimparDente}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-600)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              Limpar dente inteiro
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const ativo = statusFaceAtual === key
              return (
                <button
                  key={key}
                  onClick={() => onSelecionarStatus(key as StatusFace)}
                  disabled={!faceSelecionada}
                  style={{
                    fontSize: 'var(--text-xs)',
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: `1px solid ${cfg.cor}`,
                    background: ativo ? cfg.cor : 'transparent',
                    color: ativo ? 'white' : cfg.cor,
                    cursor: faceSelecionada ? 'pointer' : 'not-allowed',
                    opacity: faceSelecionada ? 1 : 0.5,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: ativo ? 600 : 400,
                    transition: 'all 100ms ease',
                  }}
                >
                  {cfg.label}
                </button>
              )
            })}
            {statusFaceAtual && (
              <button
                onClick={onLimparFace}
                style={{
                  fontSize: 'var(--text-xs)',
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Limpar face
              </button>
            )}
          </div>
        </div>

        {/* Histórico de alterações */}
        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border-divider)' }}>
          <button
            onClick={() => setHistoricoAberto(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ transform: historicoAberto ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 120ms ease', fontSize: 10, color: 'var(--text-muted)' }}>▶</span>
            Histórico {historico.length > 0 && `(${historico.length})`}
          </button>
          {historicoAberto && (
            carregandoHistorico ? (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>Carregando...</p>
            ) : historico.length === 0 ? (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>Nenhuma alteração registrada ainda</p>
            ) : (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {historico.map(item => (
                  <div key={item.id} style={{ fontSize: 'var(--text-xs)', borderLeft: '2px solid var(--border-default)', paddingLeft: 8 }}>
                    <div style={{ color: 'var(--text-strong)' }}>
                      {item.campo === 'nota' ? 'Nota' : FACE_LABEL_HIST[item.face as Face]}
                      {': '}
                      {formatarValorHistorico(item.campo, item.valor_anterior)} → {formatarValorHistorico(item.campo, item.valor_novo)}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.criado_em).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}