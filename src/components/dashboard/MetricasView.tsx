'use client'

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

  const consultasPorMes = (() => {
    const meses: Record<string, number> = {}
    const hoje = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    consultas.forEach(c => {
      const d = new Date(c.scheduled_at)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in meses) meses[key]++
    })
    return Object.entries(meses).map(([mes, total]) => ({ mes, total }))
  })()

  const receitaPorMes = (() => {
    const meses: Record<string, number> = {}
    const hoje = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    consultas.forEach(c => {
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
    consultas.forEach(c => {
      counts[c.status] = (counts[c.status] ?? 0) + 1
    })
    return Object.entries(counts).map(([status, value]) => ({ status, value }))
  })()

  const porServico = (() => {
    const counts: Record<string, number> = {}
    consultas.forEach(c => {
      const s = getServico(c.services)
      const nome = s?.name ?? 'Sem serviço'
      counts[nome] = (counts[nome] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([servico, total]) => ({ servico, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total de pacientes', value: totalPacientes },
          { label: 'Total de consultas', value: totalConsultas },
          { label: 'Consultas realizadas', value: totalRealizadas },
          { label: 'Taxa de no-show', value: `${taxaNoShow}%` },
          { label: 'Consultas perdidas', value: totalFaltou },
          { label: 'Receita total', value: `R$ ${receitaTotal.toFixed(2)}` },
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

      <Card title="Receita por mês (R$)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={receitaPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`R$ ${v}`, 'Receita']} />
            <Line type="monotone" dataKey="receita" stroke="#1D9E75" strokeWidth={2} dot={{ r: 4 }} name="Receita" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Status das consultas">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={CORES_STATUS[entry.status] ?? '#888780'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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