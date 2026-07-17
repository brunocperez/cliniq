'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastProvider'
import { gerarConteudoPost } from '@/lib/gerarConteudoPost'

interface PostCriado {
  id: string
  titulo: string
  pauta: string | null
  legenda: string | null
  arte_sugestao: string | null
  tipo: string
  status: string
  prioridade: string
  origem: string
  data_agendada: string | null
  criado_em: string
}

interface ImagemBanco {
  id: string
  imagem_path: string
  descricao: string | null
  url?: string
}

interface Props {
  onFechar: () => void
  onCriado: (post: PostCriado) => void
}

const inputStyle = {
  width: '100%', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
  padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none',
  boxSizing: 'border-box' as const, color: 'var(--text-body)', background: 'var(--surface-card)',
}
const labelStyle = { display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }

export default function CriarPostModal({ onFechar, onCriado }: Props) {
  const { mostrarToast } = useToast()
  const [ideia, setIdeia] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagens, setImagens] = useState<ImagemBanco[]>([])
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)
  const [buscaImagem, setBuscaImagem] = useState('')

  // Carrega as imagens do banco pra o dentista poder escolher uma
  useEffect(() => {
    let cancelado = false
    async function carregar() {
      const supabase = createClient()
      const { data } = await supabase
        .from('imagens_marketing')
        .select('id, imagem_path, descricao')
        .order('criado_em', { ascending: false })
      if (!cancelado && data) {
        const comUrls = await Promise.all(
          data.map(async (img) => {
            const { data: signed } = await supabase.storage
              .from('imagens_marketing')
              .createSignedUrl(img.imagem_path, 3600)
            return { ...img, url: signed?.signedUrl }
          })
        )
        setImagens(comUrls as ImagemBanco[])
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [])

  async function handleCriar() {
    if (!ideia.trim()) {
      mostrarToast('Descreva a ideia do post.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      const { data: profile } = await supabase.from('profiles').select('tenant_id').single()
      if (!profile?.tenant_id) throw new Error('sem tenant')

      // A IA gera legenda + arte a partir da ideia (e da imagem base, quando real)
      const conteudo = await gerarConteudoPost(ideia)

      const { data, error } = await supabase
        .from('posts_marketing')
        .insert({
          tenant_id: profile.tenant_id,
          titulo: conteudo.titulo,
          pauta: ideia.trim(),
          legenda: conteudo.legenda,
          arte_sugestao: conteudo.arteSugestao,
          tipo: 'feed',
          status: 'rascunho',
          prioridade: 'normal',
          origem: 'sugestao',
          imagem_base_id: imagemSelecionada,
        })
        .select('*')
        .single()
      if (error) throw error

      mostrarToast('Post criado pela IA! Revise antes de publicar.', 'sucesso')
      onCriado(data as PostCriado)
      onFechar()
    } catch (err) {
      console.error('Erro ao criar post:', err)
      mostrarToast('Erro ao criar o post.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal titulo="Criar post" onFechar={onFechar} largura={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Qual a ideia do post?</label>
          <textarea
            value={ideia}
            onChange={e => setIdeia(e.target.value)}
            placeholder="Ex: a importância da limpeza a cada 6 meses"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            autoFocus
          />
          <p style={{ margin: '6px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
            A IA vai transformar sua ideia numa legenda profissional e gerar a arte.
          </p>
        </div>

        {/* Seletor opcional de imagem do banco, com busca */}
        {imagens.length > 0 && (
          <div>
            <label style={labelStyle}>Usar uma imagem do banco? (opcional)</label>
            <input
              type="text"
              value={buscaImagem}
              onChange={e => setBuscaImagem(e.target.value)}
              placeholder="Buscar por descrição (ex: sorriso, consultório...)"
              style={{ ...inputStyle, marginBottom: 8, fontSize: 'var(--text-xs)', padding: '6px 10px' }}
            />
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 8,
                maxHeight: 220, overflowY: 'auto', padding: 2,
                border: '1px solid var(--border-divider)', borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              {imagens
                .filter(img => !buscaImagem.trim() || (img.descricao ?? '').toLowerCase().includes(buscaImagem.trim().toLowerCase()))
                .map(img => {
                  const selecionada = imagemSelecionada === img.id
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setImagemSelecionada(selecionada ? null : img.id)}
                      title={img.descricao ?? ''}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md, 6px)', overflow: 'hidden',
                        border: `2px solid ${selecionada ? 'var(--brand)' : 'var(--border-default)'}`,
                        padding: 0, cursor: 'pointer', background: 'var(--surface-sunken)',
                        outline: selecionada ? '2px solid var(--brand)' : 'none', outlineOffset: 1,
                      }}
                    >
                      {img.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt={img.descricao ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      )}
                    </button>
                  )
                })}
              {imagens.filter(img => !buscaImagem.trim() || (img.descricao ?? '').toLowerCase().includes(buscaImagem.trim().toLowerCase())).length === 0 && (
                <p style={{ gridColumn: '1 / -1', fontSize: 'var(--text-xs)', color: 'var(--text-faint)', margin: '8px 0', textAlign: 'center' }}>
                  Nenhuma imagem encontrada para &quot;{buscaImagem}&quot;
                </p>
              )}
            </div>
            {imagemSelecionada && (
              <p style={{ margin: '6px 0 0', fontSize: 'var(--text-xs)', color: 'var(--brand)' }}>
                Imagem selecionada — a IA usará ela como base. Clique de novo para desmarcar.
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onFechar} disabled={loading}>Cancelar</Button>
          <Button onClick={handleCriar} disabled={loading}>{loading ? 'Gerando...' : '✨ Gerar post'}</Button>
        </div>
      </div>
    </Modal>
  )
}