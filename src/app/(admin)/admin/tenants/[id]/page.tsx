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

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{valor || '—'}</p>
    </div>
  )
}

export default async function TenantDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: tenant }, { data: profile }] = await Promise.all([
    adminSupabase.from('tenants').select('*').eq('id', id).single(),
    adminSupabase.from('profiles').select('*').eq('tenant_id', id).eq('role', 'client').single(),
  ])

  if (!tenant) notFound()

  const { data: authUser } = await adminSupabase.auth.admin.getUserById(profile?.id ?? '')
  const email = authUser?.user?.email ?? '—'

  const { data: cobrancas } = await adminSupabase
    .from('cobrancas')
    .select('*')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const trialExpirado = tenant.plano === 'trial' && tenant.trial_ends_at && new Date(tenant.trial_ends_at) < new Date()
  const diasTrial = tenant.trial_ends_at
    ? Math.ceil((new Date(tenant.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 'var(--text-sm)', color: 'var(--brand)' }}>← Voltar</Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
              {tenant.name}
            </h1>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: tenant.is_active ? 'var(--realizado-fill)' : 'var(--faltou-fill)',
                color: tenant.is_active ? 'var(--realizado-ink)' : 'var(--faltou-ink)',
              }}>
                {tenant.is_active ? 'ativo' : 'bloqueado'}
              </span>
              {tenant.plano === 'trial' && (
                <span style={{
                  fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: trialExpirado ? 'var(--faltou-fill)' : 'var(--agendado-fill)',
                  color: trialExpirado ? 'var(--faltou-ink)' : 'var(--agendado-ink)',
                }}>
                  {trialExpirado ? 'Trial expirado' : `Trial · ${diasTrial}d restantes`}
                </span>
              )}
            </div>
          </div>
          <Link href={`/admin/tenants/${id}/editar`}>
            <Button variant="secondary" size="sm">Editar</Button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title="Dados do consultório">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Campo label="Nome" valor={tenant.name} />
            <Campo label="Especialidade" valor={tenant.specialty} />
            <Campo label="WhatsApp do consultório" valor={tenant.whatsapp_consultorio} />
            <Campo label="Cadastrado em" valor={new Date(tenant.created_at).toLocaleDateString('pt-BR')} />
          </div>
        </Card>

        <Card title="Dados do responsável">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Campo label="Nome do responsável" valor={profile?.responsible_name ?? ''} />
            <Campo label="WhatsApp do responsável" valor={profile?.whatsapp_responsavel ?? ''} />
            <Campo label="E-mail de acesso" valor={email} />
          </div>
        </Card>

        <Card title="Cobranças" padded={false}>
          {cobrancas && cobrancas.length > 0 ? (
            <div>
              {cobrancas.map(c => {
                const info = statusInfo[c.status] ?? statusInfo.pendente
                return (
                  <div key={c.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-divider)' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>
                        {Number(c.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Vence em {new Date(c.vencimento).toLocaleDateString('pt-BR')} · {c.metodo}
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
    </div>
  )
}