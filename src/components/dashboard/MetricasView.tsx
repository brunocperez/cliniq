'use client'

import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
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

type Periodo = 'mes' | 'trimestre' | 'ano' | 'todos'

function getServico(services: Consulta['services']): { name: string; price: number } | null {
  if (!services) return null
  if (Array.isArray(services)) return services[0] ?? null
  return services
}

const metricCardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
}

export default function MetricasView({
  totalPacientes, totalConsultas, totalRealizadas,
  totalFaltou, receitaTotal, taxaNoShow, consultas
}: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')

  const agora = new Date()
  const consultasFiltradas = consultas.filter(c => {
    const d = new Date(c.scheduled_at)
    if (periodo === 'mes') {
      return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()
    }
    if (periodo === 'trimestre') {
      const trimestre = Math.floor(agora.getMonth() / 3)
      const trimestreConsulta = Math.floor(d.getMonth() / 3)
      return trimestreConsulta === trimestre && d.getFullYear() === agora.getFullYear()
    }
    if (periodo === 'ano') {
      return d.getFullYear() === agora.getFullYear()
    }
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

  const consultasPorMes = (() => {
    const meses: Record<string, number> = {}
    for (let i = mesesParaExibir - 1; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    consultasFiltradas.forEach(c => {
      const d = new Date(c.scheduled_at)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) meses[key]++
    })
    return Object.entries(meses).map(([mes, total]) => ({ mes, total }))
  })()

  const receitaPorMes = (() => {
    const meses: Record<string, number> = {}
    for (let i = mesesParaExibir - 1; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    consultasFiltradas.forEach(c => {
      if (c.status !== 'realizado') return
      const d = new Date(c.scheduled_at)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) {
        const s = getServico(c.services)
        meses[key] += Number(s?.price ?? 0)
      }
    })
    return Object.entries(meses).map(([mes, receita]) => ({ mes, receita: Math.round(receita) }))
  })()

  const statusData = (() => {
    const counts: Record<string, number> = {}
    consultasFiltradas.forEach(c => {
      counts[c.status] = (counts[c.status] ?? 0) + 1
    })
    return Object.entries(counts).map(([status, value]) => ({ status, value }))
  })()

  const porServico = (() => {
    const counts: Record<string, number> = {}
    consultasFiltradas.forEach(c => {
      const s = getServico(c.services)
      const nome = s?.name ?? 'Sem serviço'
      counts[nome] = (counts[nome] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([servico, total]) => ({ servico, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  })()

  const periodos: { value: Periodo; label: string }[] = [
    { value: 'mes', label: 'Este mês' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'ano', label: 'Este ano' },
    { value: 'todos', label: 'Todos' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Filtro de período */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
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
              fontWeight: periodo === p.value ? 'var(--weight-medium)' : 'var(--weight-normal)',
              background: periodo === p.value ? 'var(--surface-card)' : 'transparent',
              color: periodo === p.value ? 'var(--text-strong)' : 'var(--text-muted)',
              boxShadow: periodo === p.value ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Cards de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total de pacientes', value: totalPacientes },
          { label: 'Total de consultas', value: totalConsultasFiltradas },
          { label: 'Consultas realizadas', value: totalRealizadasFiltradas },
          { label: 'Taxa de no-show', value: `${taxaNoShowFiltrada}%` },
          { label: 'Consultas perdidas', value: totalFaltouFiltradas },
          { label: 'Receita', value: receitaFiltrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        ].map(({ label, value }) => (
          <div key={label} style={metricCardStyle}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{value}</p>
          </div>
        ))}
      </div>

      <Card title="Consultas por mês">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={consultasPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="total" fill="#378ADD" radius={[4, 4, 0, 0]} name="Consultas" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Receita por mês">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={receitaPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Receita']} />
            <Line type="monotone" dataKey="receita" stroke="#1D9E75" strokeWidth={2} dot={{ r: 4 }} name="Receita" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Status das consultas">
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              {statusData.map(({ status, value }) => {
                const total = statusData.reduce((a, b) => a + b.value, 0)
                const pct = Math.round((value / total) * 100)
                const fill = CORES_STATUS[status] ?? '#888780'
                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 80, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize', flexShrink: 0 }}>{status}</span>
                    <div style={{ flex: 1, height: 10, background: '#F3F4F6', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: fill, borderRadius: 9999 }} />
                    </div>
                    <span style={{ width: 28, textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-body)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{value}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', textAlign: 'center', padding: '32px 0' }}>Sem dados ainda.</p>
          )}
        </Card>

        <Card title="Consultas por serviço">
          {porServico.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porServico} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="servico" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="total" fill="#7F77DD" radius={[0, 4, 4, 0]} name="Consultas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)', textAlign: 'center', padding: '32px 0' }}>Sem dados ainda.</p>
          )}
        </Card>
      </div>

    </div>
  )
}
