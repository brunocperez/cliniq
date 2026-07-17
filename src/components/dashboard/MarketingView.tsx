'use client'

interface Post {
  id: string
  titulo: string
  status: string
  prioridade: string
  origem: string
  criado_em: string
}

interface Props {
  postsIniciais: Post[]
}

export default function MarketingView({ postsIniciais }: Props) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
        {postsIniciais.length === 0
          ? 'Nenhum post ainda. Em breve: gerar conteúdo com IA e cronograma.'
          : `${postsIniciais.length} post(s) cadastrado(s).`}
      </p>
    </div>
  )
}