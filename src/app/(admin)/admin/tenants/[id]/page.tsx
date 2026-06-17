import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CobrancaActions from '@/components/admin/CobrancaActions'

const statusInfo: Record<string, { label: string; fill: string; ink: string }> = {
  pendente: { label: 'Pendente', fill: 'var(--agendado-fill)', ink: 'var(--agendado-ink)' },
  pago: { label: 'Pago', fill: 'var(--realizado-fill)', ink: 'var(--realizado-ink)' },
  vencido: { label: 'Vencido', fill: 'var(--faltou-fill)', ink: 'var(--faltou-ink)' },
}

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

  const { data: cobrancas } = await adminSupabase
    .from('cobrancas')
    .select('*')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

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

      <Card title="Dados do responsável" style={{ marginBottom: 16 }}>
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

      <Card title="Cobranças" padded={false}>
        {cobrancas && cobrancas.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {cobrancas.map(c => {
              const info = statusInfo[c.status] ?? statusInfo.pendente
              return (
                <div key={c.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>
                      {Number(c.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Vencimento: {new Date(c.vencimento).toLocaleDateString('pt-BR')} · {c.metodo}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', padding: '2px 10px', borderRadius: 'var(--radius-pill)', background: info.fill, color: info.ink }}>
                      {info.label}
                    </span>
                    {c.status !== 'pago' && (
                      <CobrancaActions cobrancaId={c.id} tenantId={id} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ padding: '32px 20px', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-faint)' }}>
            Nenhuma cobrança gerada ainda.
          </p>
        )}
      </Card>
    </div>
  )
}