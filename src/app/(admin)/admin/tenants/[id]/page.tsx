import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default async function TenantDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (!tenant) notFound()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', id)
    .eq('role', 'client')
    .single()

  const { data: authUser } = await adminSupabase.auth.admin.getUserById(profile?.id ?? '')
  const email = authUser?.user?.email ?? '—'

  return (
    <div className="max-w-lg">
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" className="text-sm hover:opacity-70" style={{ color: 'var(--brand)' }}>← Voltar</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{tenant.name}</h1>
            <span style={{
              display: 'inline-block',
              marginTop: 4,
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-medium)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: tenant.is_active ? 'var(--realizado-fill)' : 'var(--faltou-fill)',
              color: tenant.is_active ? 'var(--realizado-ink)' : 'var(--faltou-ink)',
            }}>
              {tenant.is_active ? 'ativo' : 'bloqueado'}
            </span>
          </div>
          <Link href={`/admin/tenants/${id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
        </div>
      </div>

      <Card title="Dados do consultório" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Nome</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{tenant.name ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Especialidade</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{tenant.specialty ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>WhatsApp do consultório</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{tenant.whatsapp_consultorio ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Cadastrado em</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </Card>

      <Card title="Dados do responsável">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Nome do responsável</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{profile?.responsible_name ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>WhatsApp do responsável</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{profile?.whatsapp_responsavel ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>E-mail de acesso</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{email}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}