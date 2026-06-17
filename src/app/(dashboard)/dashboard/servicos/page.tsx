import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ServicosView from '@/components/dashboard/ServicosView'
import Button from '@/components/ui/Button'

export default async function ServicosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single()

  const { data: servicos } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('name', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Serviços</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Os serviços que você oferece</p>
        </div>
        <Link href="/dashboard/servicos/novo">
          <Button>+ Novo serviço</Button>
        </Link>
      </div>
      <ServicosView servicos={servicos ?? []} />
    </div>
  )
}