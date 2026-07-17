'use client'
import { useState } from 'react'
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

      // A IA gera legenda + arte a partir da ideia
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

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onFechar} disabled={loading}>Cancelar</Button>
          <Button onClick={handleCriar} disabled={loading}>{loading ? 'Gerando...' : '✨ Gerar post'}</Button>
        </div>
      </div>
    </Modal>
  )
}