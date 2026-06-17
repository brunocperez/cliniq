import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import TenantActions from '@/components/admin/TenantActions'
import Button from '@/components/ui/Button'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, profiles(id, full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Tenants</h1>
        <Link href="/admin/tenants/novo">
          <Button>+ Novo acesso</Button>
        </Link>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-app)', borderBottom: '1px solid var(--border-default)' }}>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Nome</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Status</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Criado em</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants && tenants.length > 0 ? (
              tenants.map((tenant) => {
                const profile = Array.isArray(tenant.profiles)
                  ? tenant.profiles[0]
                  : tenant.profiles

                return (
                  <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                    <td className="px-4 py-3" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                      <Link href={`/admin/tenants/${tenant.id}`} style={{ color: 'inherit' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {tenant.is_active ? (
                        <span style={{ background: 'var(--realizado-fill)', color: 'var(--realizado-ink)', fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 'var(--weight-medium)' }}>
                          ativo
                        </span>
                      ) : (
                        <span style={{ background: 'var(--faltou-fill)', color: 'var(--faltou-ink)', fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 'var(--weight-medium)' }}>
                          bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <TenantActions
                        tenantId={tenant.id}
                        isActive={tenant.is_active}
                        userId={profile?.id}
                        tenantName={tenant.name}
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--text-faint)' }}>
                  Nenhum tenant cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}