'use client'

import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import Card from '@/components/ui/Card'

interface Consulta {
  scheduled_at: string
  status: string
  services: { name: string; price: number } | { name: string; price: number }[] | null
}

interface Props {
  totalPacientes: number
  totalConsultas: number
  totalRealizadas: number
  totalFaltou: number
  receitaTotal: number
  taxaNoShow: number
  consultas: Consulta[]
}

const CORES_STATUS: Record<string, string> = {
  realizado: '#1D9E75',
  agendado: '#EF9F27',
  confirmado: '#378ADD',
  faltou: '#E24B4A',
  cancelado: '#888780',
}

const STATUS_LABEL: Record<string, string> = {
  realizado: 'Realizado',
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  faltou: 'Faltou',
  cancelado: 'Cancelado',
}

type Periodo = 'mes' | 'trimestre' | 'ano' | 'todos'

function getServico(services: Consulta['services']): { name: string; price: number } | null {
  if (!services) return null
  if (Array.isArray(services)) return services[0] ?? null
  return services
}

function CardNumero({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 40, fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: '8px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>{sub}</p>}
    </div>
  )
}

export default function MetricasView({ totalPacientes, consultas }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const agora = new Date()

  const consultasFiltradas = consultas.filter(c => {
    const d = new Date(c.scheduled_at)
    if (periodo === 'mes') return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()
    if (periodo === 'trimestre') {
      const trimestre = Math.floor(agora.getMonth() / 3)
      return Math.floor(d.getMonth() / 3) === trimestre && d.getFullYear() === agora.getFullYear()
    }
    if (periodo === 'ano') return d.getFullYear() === agora.getFullYear()
    return true
  })

  const totalConsultasFiltradas = consultasFiltradas.length
  const totalRealizadasFiltradas = consultasFiltradas.filter(c => c.status === 'realizado').length
  const totalFaltouFiltradas = consultasFiltradas.filter(c => c.status === 'faltou').length
  const receitaFiltrada = consultasFiltradas
    .filter(c => c.status === 'realizado')
    .reduce((acc, c) => acc + Number(getServico(c.services)?.price ?? 0), 0)
  const taxaNoShowFiltrada = totalConsultasFiltradas
    ? Math.round((totalFaltouFiltradas / totalConsultasFiltradas) * 100)
    : 0

  const mesesParaExibir = periodo === 'mes' ? 1 : periodo === 'trimestre' ? 3 : periodo === 'ano' ? 12 : 6
  const poucosDados = mesesParaExibir < 3

  const consultasPorMes = (() => {
    const meses: Record<string, number> = {}
    for (let i = mesesParaExibir - 1; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      meses[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
    }
    consultasFiltradas.forEach(c => {
      const key = new Date(c.scheduled_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) meses[key]++
    })
    return Object.entries(meses).map(([mes, total]) => ({ mes, total }))
  })()

  const receitaPorMes = (() => {
    const meses: Record<string, number> = {}
    for (let i = mesesParaExibir - 1; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      meses[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
    }
    consultasFiltradas.forEach(c => {
      if (c.status !== 'realizado') return
      const key = new Date(c.scheduled_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) meses[key] += Number(getServico(c.services)?.price ?? 0)
    })
    return Object.entries(meses).map(([mes, receita]) => ({ mes, receita: Math.round(receita) }))
  })()

  const statusData = (() => {
    const counts: Record<string, number> = {}
    consultasFiltradas.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1 })
    return Object.entries(counts).map(([status, value]) => ({ status, value }))
      .sort((a, b) => b.value - a.value)
  })()

  const porServico = (() => {
    const counts: Record<string, number> = {}
    consultasFiltradas.forEach(c => {
      const nome = getServico(c.services)?.name ?? 'Sem serviço'
      counts[nome] = (counts[nome] ?? 0) + 1
    })
    return Object.entries(counts).map(([servico, total]) => ({ servico, total }))
      .sort((a, b) => b.total - a.total).slice(0, 6)
  })()

  const periodos: { value: Periodo; label: string }[] = [
    { value: 'mes', label: 'Este mês' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'ano', label: 'Este ano' },
    { value: 'todos', label: 'Todos' },
  ]

  const metricCards = [
    { label: 'Total de pacientes', value: totalPacientes, tone: 'default' },
    { label: 'Total de consultas', value: totalConsultasFiltradas, tone: 'default' },
    { label: 'Realizadas', value: totalRealizadasFiltradas, tone: 'brand' },
    { label: 'Taxa de no-show', value: `${taxaNoShowFiltrada}%`, tone: 'default' },
    { label: 'Perdidas', value: totalFaltouFiltradas, tone: 'default' },
    { label: 'Receita', value: receitaFiltrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), tone: 'accent' },
  ]

  const tooltipStyle = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    fontSize: 12,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Filtro de período */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
        {periodos.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            style={{
              fontSize: 'var(--text-xs)',
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: periodo === p.value ? 'var(--weight-medium)' : 'var(--weight-regular)',
              background: periodo === p.value ? 'var(--surface-card)' : 'transparent',
              color: periodo === p.value ? 'var(--text-strong)' : 'var(--text-muted)',
              boxShadow: periodo === p.value ? 'var(--shadow-xs)' : 'none',
              transition: 'all 120ms ease',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Cards de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {metricCards.map(({ label, value, tone }) => (
          <div key={label} style={{
            background: tone === 'brand' ? 'var(--brand)' : tone === 'accent' ? 'var(--cliniq-500)' : 'var(--surface-card)',
            border: tone === 'default' ? '1px solid var(--border-default)' : 'none',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: tone !== 'default' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: tone !== 'default' ? 'white' : 'var(--text-strong)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Consultas por mês */}
      <Card title="Consultas por mês">
        {poucosDados ? (
          <CardNumero
            label={`Total em ${agora.toLocaleDateString('pt-BR', { month: 'long' })}`}
            value={totalConsultasFiltradas}
            sub={totalRealizadasFiltradas > 0 ? `${totalRealizadasFiltradas} realizada(s) · ${totalFaltouFiltradas} faltou` : 'Nenhuma realizada ainda'}
          />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={consultasPorMes} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-sunken)' }} />
              <Bar dataKey="total" fill="#378ADD" radius={[4, 4, 0, 0]} name="Consultas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Receita por mês */}
      <Card title="Receita por mês">
        {poucosDados ? (
          <CardNumero
            label={`Receita em ${agora.toLocaleDateString('pt-BR', { month: 'long' })}`}
            value={receitaFiltrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            sub={totalRealizadasFiltradas > 0 ? `${totalRealizadasFiltradas} consulta(s) realizada(s)` : 'Nenhuma consulta realizada ainda'}
          />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={receitaPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Receita']}
                contentStyle={tooltipStyle}
              />
              <Line type="monotone" dataKey="receita" stroke="#1D9E75" strokeWidth={2} dot={{ r: 4, fill: '#1D9E75' }} name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Status das consultas */}
        <Card title="Status das consultas">
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
              {statusData.map(({ status, value }) => {
                const total = statusData.reduce((a, b) => a + b.value, 0)
                const pct = Math.round((value / total) * 100)
                const fill = CORES_STATUS[status] ?? '#888780'
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-body)', fontWeight: 'var(--weight-medium)' }}>
                        {STATUS_LABEL[status] ?? status}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {value} · {pct}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-divider)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: fill, borderRadius: 9999 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', textAlign: 'center', padding: '32px 0' }}>Sem dados ainda.</p>
          )}
        </Card>

        {/* Consultas por serviço */}
        <Card title="Consultas por serviço">
          {porServico.length > 0 ? (
            porServico.length < 3 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                {porServico.map(({ servico, total }) => {
                  const max = porServico[0].total
                  const pct = Math.round((total / max) * 100)
                  return (
                    <div key={servico}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-body)', fontWeight: 'var(--weight-medium)' }}>{servico}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{total}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border-divider)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#7F77DD', borderRadius: 9999 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={porServico} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="servico" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-sunken)' }} />
                  <Bar dataKey="total" fill="#7F77DD" radius={[0, 4, 4, 0]} name="Consultas" />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', textAlign: 'center', padding: '32px 0' }}>Sem dados ainda.</p>
          )}
        </Card>
      </div>
    </div>
  )
}