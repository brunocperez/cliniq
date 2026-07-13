'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import TenantActions from '@/components/admin/TenantActions'
import NovoAcessoModal from '@/components/admin/NovoAcessoModal'
import ThemeToggle from '@/components/ThemeToggle'

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

type FiltroStatus = 'todos' | 'ativo' | 'bloqueado'
type FiltroPlan = 'todos' | 'trial' | 'pago'

export default function AdminTenantsView({ tenants }: Props) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [filtroPlano, setFiltroPlano] = useState<FiltroPlan>('todos')

  const hoje = new Date()

  const totalAtivos = tenants.filter(t => t.is_active).length
  const totalTrial = tenants.filter(t => t.plano === 'trial' && t.trial_ends_at && new Date(t.trial_ends_at) > hoje).length
  const totalBloqueados = tenants.filter(t => !t.is_active).length

  const tenantsFiltrados = tenants.filter(t => {
    const matchBusca = busca === '' || t.name.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || (filtroStatus === 'ativo' ? t.is_active : !t.is_active)
    const matchPlano = filtroPlano === 'todos' ||
      (filtroPlano === 'trial' ? t.plano === 'trial' : t.plano !== 'trial')
    return matchBusca && matchStatus && matchPlano
  })

  function getPlanoLabel(tenant: Tenant) {
    if (tenant.plano === 'trial') {
      if (!tenant.trial_ends_at) return 'Trial'
      const diasRestantes = Math.ceil((new Date(tenant.trial_ends_at).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      if (diasRestantes <= 0) return 'Trial expirado'
      return `Trial · ${diasRestantes}d`
    }
    return tenant.plano ?? '—'
  }

  function getPlanoStyle(tenant: Tenant) {
    if (tenant.plano === 'trial') {
      const expirado = tenant.trial_ends_at && new Date(tenant.trial_ends_at) < hoje
      return {
        background: expirado ? 'var(--faltou-fill)' : 'var(--agendado-fill)',
        color: expirado ? 'var(--faltou-ink)' : 'var(--agendado-ink)',
      }
    }
    return { background: 'var(--confirmado-fill)', color: 'var(--confirmado-ink)' }
  }

  return (
    <div>
      {mostrarModal && <NovoAcessoModal onFechar={() => setMostrarModal(false)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>Admin · Clínicas</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{tenants.length} clínica(s) cadastrada(s)</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle />
          <Button onClick={() => setMostrarModal(true)}>+ Novo acesso</Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total de clínicas', value: tenants.length, cor: 'default' },
          { label: 'Ativas', value: totalAtivos, cor: 'brand' },
          { label: 'Em trial', value: totalTrial, cor: 'warning' },
          { label: 'Bloqueadas', value: totalBloqueados, cor: 'danger' },
        ].map(({ label, value, cor }) => (
          <div key={label} style={{
            background: cor === 'brand' ? 'var(--brand)' : 'var(--surface-card)',
            border: cor === 'default' ? '1px solid var(--border-default)' : cor === 'brand' ? 'none' : `1px solid ${cor === 'warning' ? 'var(--agendado-fill)' : 'var(--faltou-fill)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: cor === 'brand' ? 'rgba(255,255,255,0.8)' : cor === 'warning' ? 'var(--agendado-ink)' : cor === 'danger' ? 'var(--faltou-ink)' : 'var(--text-muted)' }}>
              {label}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: cor === 'brand' ? 'white' : cor === 'warning' ? 'var(--agendado-ink)' : cor === 'danger' ? 'var(--faltou-ink)' : 'var(--text-strong)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar clínica..."
          style={{
            flex: 1,
            minWidth: 200,
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            color: 'var(--text-body)',
            background: 'var(--surface-card)',
          }}
        />
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value as FiltroStatus)}
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            color: 'var(--text-body)',
            background: 'var(--surface-card)',
            cursor: 'pointer',
          }}
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
        <select
          value={filtroPlano}
          onChange={e => setFiltroPlano(e.target.value as FiltroPlan)}
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            color: 'var(--text-body)',
            background: 'var(--surface-card)',
            cursor: 'pointer',
          }}
        >
          <option value="todos">Todos os planos</option>
          <option value="trial">Trial</option>
          <option value="pago">Pago</option>
        </select>
        {(busca || filtroStatus !== 'todos' || filtroPlano !== 'todos') && (
          <Button variant="ghost" size="sm" onClick={() => { setBusca(''); setFiltroStatus('todos'); setFiltroPlano('todos') }}>
            Limpar
          </Button>
        )}
      </div>

      {/* Tabela */}
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
            {tenantsFiltrados.length > 0 ? (
              tenantsFiltrados.map(tenant => {
                const profile = Array.isArray(tenant.profiles) ? tenant.profiles[0] : tenant.profiles
                const planoStyle = getPlanoStyle(tenant)
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
                        fontSize: 'var(--text-xs)', padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)', fontWeight: 'var(--weight-medium)',
                      }}>
                        {tenant.is_active ? 'ativo' : 'bloqueado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{
                        ...planoStyle,
                        fontSize: 'var(--text-xs)', padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)', fontWeight: 'var(--weight-medium)',
                      }}>
                        {getPlanoLabel(tenant)}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
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
                  Nenhuma clínica encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}