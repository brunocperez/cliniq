'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import TenantActions from '@/components/admin/TenantActions'
import NovoAcessoModal from '@/components/admin/NovoAcessoModal'

interface Tenant {
  id: string
  name: string
  is_active: boolean
  created_at: string
  plano: string | null
  trial_ends_at: string | null
  profiles: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null
}

interface Props {
  tenants: Tenant[]
}

export default function AdminTenantsView({ tenants }: Props) {
  const [mostrarModal, setMostrarModal] = useState(false)

  function getPlanoLabel(tenant: Tenant) {
    if (tenant.plano === 'trial') {
      if (!tenant.trial_ends_at) return 'Trial'
      const fim = new Date(tenant.trial_ends_at)
      const hoje = new Date()
      const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      if (diasRestantes <= 0) return 'Trial expirado'
      return `Trial · ${diasRestantes}d restantes`
    }
    return tenant.plano ?? '—'
  }

  return (
    <div>
      {mostrarModal && <NovoAcessoModal onFechar={() => setMostrarModal(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>Admin · Clínicas</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{tenants.length} clínica(s) cadastrada(s)</p>
        </div>
        <Button onClick={() => setMostrarModal(true)}>+ Novo acesso</Button>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Clínica</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Status</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Plano</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Cadastro</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length > 0 ? (
              tenants.map(tenant => {
                const profile = Array.isArray(tenant.profiles) ? tenant.profiles[0] : tenant.profiles
                return (
                  <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-strong)')}
                      >
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{
                        background: tenant.is_active ? 'var(--realizado-fill)' : 'var(--faltou-fill)',
                        color: tenant.is_active ? 'var(--realizado-ink)' : 'var(--faltou-ink)',
                        fontSize: 'var(--text-xs)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 'var(--weight-medium)',
                      }}>
                        {tenant.is_active ? 'ativo' : 'bloqueado'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {getPlanoLabel(tenant)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <TenantActions
                        tenantId={tenant.id}
                        isActive={tenant.is_active}
                        userId={profile?.id ?? ''}
                        tenantName={tenant.name}
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-faint)' }}>
                  Nenhuma clínica cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}