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

  // Arquivo escolhido mas ainda NÃO enviado — só some quando clicar em Salvar
  const [arquivoEscolhido, setArquivoEscolhido] = useState<File | null>(null)
  const [previaUrl, setPreviaUrl] = useState<string | null>(null)

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

  // Passo 1: escolher a imagem — só guarda localmente e mostra a prévia
  function handleEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setArquivoEscolhido(file)
    setPreviaUrl(URL.createObjectURL(file))
  }

  function cancelarEscolha() {
    setArquivoEscolhido(null)
    setPreviaUrl(null)
    setDescricao('')
  }

  // Passo 2: salvar de fato — sobe pro Storage e registra no banco
  async function handleSalvar() {
    if (!arquivoEscolhido) {
      mostrarToast('Escolha uma imagem primeiro.')
      return
    }
    setEnviando(true)
    const supabase = createClient()
    try {
      const { data: profile } = await supabase.from('profiles').select('tenant_id').single()
      if (!profile?.tenant_id) throw new Error('sem tenant')

      const caminho = `${profile.tenant_id}/${Date.now()}-${arquivoEscolhido.name}`
      const { error: upErro } = await supabase.storage.from('imagens_marketing').upload(caminho, arquivoEscolhido)
      if (upErro) throw upErro

      const { data, error } = await supabase
        .from('imagens_marketing')
        .insert({ tenant_id: profile.tenant_id, imagem_path: caminho, descricao: descricao.trim() || null })
        .select('*')
        .single()
      if (error) throw error

      const { data: signed } = await supabase.storage.from('imagens_marketing').createSignedUrl(caminho, 3600)
      setImagens(prev => [{ ...(data as ImagemBanco), url: signed?.signedUrl }, ...prev])
      cancelarEscolha()
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
      {/* Adicionar imagem — fluxo em 3 passos: descrição, escolher, salvar */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
        <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Adicionar imagem</p>
        <p style={{ margin: '0 0 12px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Suba fotos da sua clínica, atendimentos ou resultados. A IA poderá usá-las como base ao gerar a arte dos posts.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Prévia da imagem escolhida (só aparece depois de escolher) */}
          {previaUrl && (
            <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-default)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previaUrl} alt="Prévia" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição/tag (ex: consultório, sorriso paciente)"
              style={{
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
                background: 'var(--surface-card)', color: 'var(--text-body)',
              }}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label
                style={{
                  fontSize: 'var(--text-sm)', padding: '8px 16px', borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-default)', background: 'var(--surface-card)', color: 'var(--text-strong)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                {arquivoEscolhido ? 'Trocar imagem' : 'Escolher imagem'}
                <input type="file" accept="image/*" onChange={handleEscolherArquivo} style={{ display: 'none' }} />
              </label>

              {arquivoEscolhido && (
                <>
                  <button
                    onClick={handleSalvar}
                    disabled={enviando}
                    style={{
                      fontSize: 'var(--text-sm)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none',
                      background: enviando ? 'var(--surface-sunken)' : 'var(--brand)', color: enviando ? 'var(--text-faint)' : 'white',
                      cursor: enviando ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500,
                    }}
                  >
                    {enviando ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={cancelarEscolha}
                    disabled={enviando}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)' }}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
            {arquivoEscolhido && (
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                {arquivoEscolhido.name}
              </p>
            )}
          </div>
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