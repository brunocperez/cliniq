'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'
import CriarPostModal from '@/components/dashboard/CriarPostModal'
import BancoImagens from '@/components/dashboard/BancoImagens'

interface Post {
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
  postsIniciais: Post[]
}

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  rascunho: { label: 'Rascunho', cor: '#6b7280' },
  pronto: { label: 'Pronto', cor: '#2563eb' },
  agendado: { label: 'Agendado', cor: '#eab308' },
  publicado: { label: 'Publicado', cor: '#16a34a' },
}

const PRIORIDADE_CONFIG: Record<string, { label: string; cor: string }> = {
  urgente: { label: 'Urgente', cor: '#dc2626' },
  proximo: { label: 'Próximo', cor: '#eab308' },
  normal: { label: 'Normal', cor: '#6b7280' },
}

const ORDEM_STATUS = ['rascunho', 'pronto', 'agendado', 'publicado']

export default function MarketingView({ postsIniciais }: Props) {
  const { mostrarToast } = useToast()
  const [posts, setPosts] = useState<Post[]>(postsIniciais)
  const [modalCriar, setModalCriar] = useState(false)
  const [aba, setAba] = useState<'posts' | 'imagens'>('posts')

  async function mudarStatus(post: Post, novoStatus: string) {
    const supabase = createClient()
    const { error } = await supabase.from('posts_marketing').update({ status: novoStatus }).eq('id', post.id)
    if (!error) {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: novoStatus } : p))
      mostrarToast('Status atualizado.', 'sucesso')
    } else {
      mostrarToast('Erro ao atualizar o status.')
    }
  }

  async function excluir(post: Post) {
    const supabase = createClient()
    const { error } = await supabase.from('posts_marketing').delete().eq('id', post.id)
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== post.id))
      mostrarToast('Post removido.', 'sucesso')
    } else {
      mostrarToast('Erro ao remover o post.')
    }
  }

  const porStatus = ORDEM_STATUS.map(status => ({ status, posts: posts.filter(p => p.status === status) }))

  return (
    <div>
      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-divider)' }}>
        {([
          { value: 'posts' as const, label: 'Posts' },
          { value: 'imagens' as const, label: 'Banco de imagens' },
        ]).map(t => (
          <button
            key={t.value}
            onClick={() => setAba(t.value)}
            style={{
              padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
              fontWeight: aba === t.value ? 600 : 400,
              color: aba === t.value ? 'var(--brand)' : 'var(--text-muted)',
              borderBottom: aba === t.value ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === 'imagens' ? (
        <BancoImagens />
      ) : (
      <>
      {/* Barra de ações */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setModalCriar(true)}
          style={{
            fontSize: 'var(--text-sm)', padding: '10px 18px', borderRadius: 'var(--radius-pill)', border: 'none',
            background: 'var(--brand)', color: 'white',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500,
          }}
        >
          Criar post
        </button>
      </div>

      {posts.length === 0 ? (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
            Nenhum post ainda. Gere um com IA ou adicione uma sugestão.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {porStatus.map(coluna => (
            <div key={coluna.status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_CONFIG[coluna.status].cor }} />
                <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{STATUS_CONFIG[coluna.status].label}</h2>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>({coluna.posts.length})</span>
              </div>

              {coluna.posts.length === 0 ? (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', margin: '0 0 0 18px' }}>Nenhum post</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {coluna.posts.map(post => (
                    <div key={post.id} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md, 8px)', padding: 14, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                        <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{post.titulo}</h3>
                        {post.prioridade !== 'normal' && (
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 'var(--radius-pill)', background: PRIORIDADE_CONFIG[post.prioridade].cor, color: 'white', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {PRIORIDADE_CONFIG[post.prioridade].label}
                          </span>
                        )}
                      </div>
                      {post.legenda && (
                        <p style={{ margin: '0 0 8px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.legenda}</p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-faint)', marginBottom: 10 }}>
                        <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-sunken)' }}>{post.origem === 'ia' ? '✨ IA' : '✍ Sugestão'}</span>
                        <span>·</span>
                        <span>{post.tipo === 'feed' ? 'Feed' : 'Stories'}</span>
                      </div>

                      {/* Ações */}
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <select
                          value={post.status}
                          onChange={e => mudarStatus(post, e.target.value)}
                          style={{
                            fontSize: 10, padding: '4px 6px', borderRadius: 'var(--radius-md, 6px)',
                            border: `1px solid ${STATUS_CONFIG[post.status].cor}`, color: STATUS_CONFIG[post.status].cor,
                            background: 'transparent', fontFamily: 'var(--font-sans)', flex: 1,
                          }}
                        >
                          {ORDEM_STATUS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                        </select>
                        <button
                          onClick={() => excluir(post)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-600)', fontSize: 10, fontFamily: 'var(--font-sans)' }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      </>
      )}

      {modalCriar && (
        <CriarPostModal
          onFechar={() => setModalCriar(false)}
          onCriado={novoPost => setPosts(prev => [novoPost, ...prev])}
        />
      )}
    </div>
  )
}