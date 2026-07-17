'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'

interface ImagemBanco {
  id: string
  imagem_path: string
  descricao: string | null
  criado_em: string
  url?: string   // URL assinada, gerada no cliente pra exibir
}

export default function BancoImagens() {
  const { mostrarToast } = useToast()
  const [imagens, setImagens] = useState<ImagemBanco[]>([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('imagens_marketing')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!cancelado && data) {
        // Gera URLs assinadas pra exibir cada imagem (bucket é privado)
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
      if (!cancelado) setCarregando(false)
    }
    carregar()
    return () => { cancelado = true }
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setEnviando(true)
    const supabase = createClient()
    try {
      const { data: profile } = await supabase.from('profiles').select('tenant_id').single()
      if (!profile?.tenant_id) throw new Error('sem tenant')

      const caminho = `${profile.tenant_id}/${Date.now()}-${file.name}`
      const { error: upErro } = await supabase.storage.from('imagens_marketing').upload(caminho, file)
      if (upErro) throw upErro

      const { data, error } = await supabase
        .from('imagens_marketing')
        .insert({ tenant_id: profile.tenant_id, imagem_path: caminho, descricao: descricao.trim() || null })
        .select('*')
        .single()
      if (error) throw error

      const { data: signed } = await supabase.storage.from('imagens_marketing').createSignedUrl(caminho, 3600)
      setImagens(prev => [{ ...(data as ImagemBanco), url: signed?.signedUrl }, ...prev])
      setDescricao('')
      mostrarToast('Imagem adicionada ao banco.', 'sucesso')
    } catch (err) {
      console.error('Erro no upload:', err)
      mostrarToast('Erro ao enviar a imagem.')
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(img: ImagemBanco) {
    const supabase = createClient()
    try {
      await supabase.storage.from('imagens_marketing').remove([img.imagem_path])
      const { error } = await supabase.from('imagens_marketing').delete().eq('id', img.id)
      if (error) throw error
      setImagens(prev => prev.filter(i => i.id !== img.id))
      mostrarToast('Imagem removida.', 'sucesso')
    } catch (err) {
      console.error('Erro ao excluir:', err)
      mostrarToast('Erro ao remover a imagem.')
    }
  }

  return (
    <div>
      {/* Upload */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
        <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Adicionar imagem</p>
        <p style={{ margin: '0 0 12px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Suba fotos da sua clínica, atendimentos ou resultados. A IA poderá usá-las como base ao gerar a arte dos posts.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descrição/tag (ex: consultório, sorriso paciente)"
            style={{
              flex: 1, minWidth: 220, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
              background: 'var(--surface-card)', color: 'var(--text-body)',
            }}
          />
          <label
            style={{
              fontSize: 'var(--text-sm)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none',
              background: enviando ? 'var(--surface-sunken)' : 'var(--brand)', color: enviando ? 'var(--text-faint)' : 'white',
              cursor: enviando ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            {enviando ? 'Enviando...' : 'Escolher imagem'}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={enviando} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Galeria */}
      {carregando ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Carregando...</p>
      ) : imagens.length === 0 ? (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
            Nenhuma imagem no banco ainda. Adicione a primeira acima.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {imagens.map(img => (
            <div key={img.id} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '1', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                {img.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.descricao ?? 'Imagem'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.descricao || 'Sem descrição'}
                </p>
                <button
                  onClick={() => excluir(img)}
                  style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-600)', fontSize: 10, fontFamily: 'var(--font-sans)', padding: 0 }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}