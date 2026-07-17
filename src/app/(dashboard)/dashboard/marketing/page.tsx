import { createServerSupabaseClient } from '@/lib/supabase/server'
import MarketingView from '@/components/dashboard/MarketingView'

export default async function MarketingPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const { data: posts } = await supabase
    .from('posts_marketing')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('criado_em', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
          Marketing
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Gere conteúdo, organize o cronograma e prepare seus posts do Instagram
        </p>
      </div>

      <MarketingView postsIniciais={posts ?? []} />
    </div>
  )
}