'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastProvider'
import { analisarRadiografia, type AchadoIA } from '@/lib/analisarRadiografia'
import { STATUS_CONFIG, type DenteData, type Face, type StatusFace } from '@/components/dashboard/OdontogramaDetalheModal'

interface Props {
  pacienteId: string
}

const FACE_LABEL: Record<Face, string> = {
  oclusal: 'Oclusal', mesial: 'Mesial', distal: 'Distal', vestibular: 'Vestibular', lingual: 'Lingual',
}

type Decisao = 'pendente' | 'aprovado' | 'rejeitado'
interface AchadoRevisavel extends AchadoIA {
  decisao: Decisao
}

export default function RadiografiaIA({ pacienteId }: Props) {
  const { mostrarToast } = useToast()
  const [analisando, setAnalisando] = useState(false)
  const [aplicando, setAplicando] = useState(false)
  const [achados, setAchados] = useState<AchadoRevisavel[]>([])
  const [analiseId, setAnaliseId] = useState<string | null>(null)
  const [imagemUrl, setImagemUrl] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setAnalisando(true)
    setAchados([])
    setAnaliseId(null)
    const supabase = createClient()

    try {
      const { data: perfil } = await supabase.from('profiles').select('tenant_id').single()
      const tenantId = perfil?.tenant_id
      if (!tenantId) throw new Error('sem tenant')

      const caminho = `${tenantId}/${pacienteId}/${Date.now()}-${file.name}`
      const { error: upErro } = await supabase.storage.from('radiografias').upload(caminho, file)
      if (upErro) throw upErro

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const resultado = await analisarRadiografia(base64)

      const { data: analise, error: insErro } = await supabase
        .from('radiografia_analises')
        .insert({ patient_id: pacienteId, imagem_path: caminho, achados: resultado.achados, status: 'pendente' })
        .select('id')
        .single()
      if (insErro) throw insErro

      // Guarda a imagem local pra mostrar no modal
      setImagemUrl(URL.createObjectURL(file))
      setAnaliseId(analise.id)
      setAchados(resultado.achados.map(a => ({ ...a, decisao: 'pendente' as Decisao })))
      setModalAberto(true)
      mostrarToast(`IA encontrou ${resultado.achados.length} achado(s) para revisar.`, 'sucesso')
    } catch (err) {
      console.error('Erro na análise:', err)
      mostrarToast('Erro ao analisar a radiografia. Tente novamente.')
    } finally {
      setAnalisando(false)
    }
  }

  function decidir(index: number, decisao: Decisao) {
    setAchados(prev => prev.map((a, i) => i === index ? { ...a, decisao } : a))
  }

  function decidirTodos(decisao: Decisao) {
    setAchados(prev => prev.map(a => ({ ...a, decisao })))
  }

  async function aplicarAprovados() {
    const aprovados = achados.filter(a => a.decisao === 'aprovado')
    if (aprovados.length === 0) {
      mostrarToast('Nenhum achado aprovado para aplicar.')
      return
    }
    setAplicando(true)
    const supabase = createClient()

    try {
      const { data: paciente } = await supabase.from('patients').select('odontograma').eq('id', pacienteId).single()
      const odontograma = { ...((paciente?.odontograma as Record<string, DenteData>) ?? {}) }

      for (const a of aprovados) {
        const denteAtual = { ...(odontograma[a.dente] ?? {}) }
        const valorAnterior = denteAtual[a.face] ?? null
        denteAtual[a.face] = a.status
        odontograma[a.dente] = denteAtual
        await supabase.from('odontograma_historico').insert({
          patient_id: pacienteId, dente: a.dente, campo: 'status', face: a.face,
          valor_anterior: valorAnterior, valor_novo: a.status,
        })
      }
      await supabase.from('patients').update({ odontograma }).eq('id', pacienteId)

      if (analiseId) {
        await supabase.from('radiografia_analises').update({ status: 'revisado' }).eq('id', analiseId)
      }

      mostrarToast(`${aprovados.length} marcação(ões) aplicada(s) no odontograma.`, 'sucesso')
      setModalAberto(false)
      setAchados([])
      setAnaliseId(null)
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      console.error('Erro ao aplicar:', err)
      mostrarToast('Erro ao aplicar as marcações.')
    } finally {
      setAplicando(false)
    }
  }

  const temPendentes = achados.some(a => a.decisao === 'pendente')
  const qtdAprovados = achados.filter(a => a.decisao === 'aprovado').length

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginTop: 16 }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
            Análise de radiografia por IA
            <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--surface-sunken)', color: 'var(--text-muted)', fontWeight: 400 }}>Beta</span>
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Envie uma radiografia panorâmica — a IA sugere marcações para você aprovar
          </p>
        </div>
        <label
          style={{
            fontSize: 'var(--text-xs)', padding: '8px 16px', borderRadius: 'var(--radius-pill)',
            border: 'none', background: analisando ? 'var(--surface-sunken)' : 'var(--brand)',
            color: analisando ? 'var(--text-faint)' : 'white', cursor: analisando ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
          }}
        >
          {analisando ? 'Analisando...' : 'Enviar radiografia'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={analisando} style={{ display: 'none' }} />
        </label>
      </div>

      {modalAberto && imagemUrl && (
        <Modal titulo="Revisar achados da radiografia" onFechar={() => setModalAberto(false)} largura={980}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Radiografia à esquerda, com marcações se houver coordenadas */}
            <div style={{ flex: '1 1 420px', minWidth: 300 }}>
              <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', background: '#000' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagemUrl} alt="Radiografia" style={{ width: '100%', display: 'block' }} />
                {/* Marcações sobre a imagem — só aparecem quando a IA fornece x/y */}
                {achados.map((a, i) => {
                  if (a.x == null || a.y == null || a.decisao === 'rejeitado') return null
                  const cor = a.decisao === 'aprovado' ? '#16a34a' : '#eab308'
                  return (
                    <div key={i} style={{
                      position: 'absolute', left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)',
                      width: 24, height: 24, borderRadius: '50%', border: `2px solid ${cor}`,
                      boxShadow: '0 0 0 2px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cor, fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.3)',
                    }}>
                      {i + 1}
                    </div>
                  )
                })}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                As marcações sobre a imagem aparecerão quando a IA fornecer a localização exata dos achados.
              </p>
            </div>

            {/* Lista de achados à direita */}
            <div style={{ flex: '1 1 380px', minWidth: 300 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <button onClick={() => decidirTodos('aprovado')} style={botaoMassaStyle('#16a34a')}>Aprovar todos</button>
                <button onClick={() => decidirTodos('rejeitado')} style={botaoMassaStyle('#dc2626')}>Rejeitar todos</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                {achados.map((a, i) => {
                  const cfg = STATUS_CONFIG[a.status as StatusFace]
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: `1px solid ${a.decisao === 'aprovado' ? '#16a34a' : a.decisao === 'rejeitado' ? '#dc2626' : 'var(--border-default)'}`,
                      background: a.decisao === 'rejeitado' ? 'var(--surface-sunken)' : 'var(--surface-card)',
                      opacity: a.decisao === 'rejeitado' ? 0.6 : 1,
                    }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: cfg.cor, color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-strong)' }}>
                          Dente {a.dente} · {FACE_LABEL[a.face]} · <strong>{cfg.label}</strong>
                        </p>
                        <p style={{ margin: '1px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>
                          Confiança: {Math.round(a.confianca * 100)}%
                        </p>
                      </div>
                      <button onClick={() => decidir(i, 'aprovado')} style={botaoDecisaoStyle(a.decisao === 'aprovado', '#16a34a')}>✓</button>
                      <button onClick={() => decidir(i, 'rejeitado')} style={botaoDecisaoStyle(a.decisao === 'rejeitado', '#dc2626')}>✕</button>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: 16, borderTop: '1px solid var(--border-divider)', paddingTop: 12 }}>
                <p style={{ margin: '0 0 8px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {qtdAprovados} de {achados.length} aprovado(s)
                  {temPendentes && ' · ainda há achados sem decisão'}
                </p>
                <button
                  onClick={aplicarAprovados}
                  disabled={aplicando || qtdAprovados === 0}
                  style={{
                    width: '100%', fontSize: 'var(--text-sm)', padding: '10px 16px', borderRadius: 'var(--radius-pill)', border: 'none',
                    background: (aplicando || qtdAprovados === 0) ? 'var(--surface-sunken)' : 'var(--brand)',
                    color: (aplicando || qtdAprovados === 0) ? 'var(--text-faint)' : 'white',
                    cursor: (aplicando || qtdAprovados === 0) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  {aplicando ? 'Aplicando...' : `Aplicar ${qtdAprovados} no odontograma`}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function botaoMassaStyle(cor: string): React.CSSProperties {
  return {
    fontSize: 'var(--text-xs)', padding: '4px 12px', borderRadius: 'var(--radius-pill)',
    border: `1px solid ${cor}`, background: 'transparent', color: cor, cursor: 'pointer', fontFamily: 'var(--font-sans)',
  }
}

function botaoDecisaoStyle(ativo: boolean, cor: string): React.CSSProperties {
  return {
    fontSize: 'var(--text-xs)', padding: '5px 10px', borderRadius: 'var(--radius-pill)',
    border: `1px solid ${cor}`, background: ativo ? cor : 'transparent', color: ativo ? 'white' : cor,
    cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0, minWidth: 32,
  }
}