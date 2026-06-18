'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Servico {
  id: string
  name: string
  duration_minutes: number
}

interface Paciente {
  id: string
  name: string
  phone: string
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  color: 'var(--text-body)',
  background: 'var(--surface-card)',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-muted)',
  marginBottom: 4,
}

export default function NovaConsultaPage() {
  const router = useRouter()

  const [servicos, setServicos] = useState<Servico[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [servicoId, setServicoId] = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function carregar() {
      const { data: s } = await supabase
        .from('services')
        .select('id, name, duration_minutes')

      const { data: p } = await supabase
        .from('patients')
        .select('id, name, phone')
        .eq('archived', false)

      setServicos(s ?? [])
      setPacientes(p ?? [])
    }
    carregar()
  }, [])

  async function handleCriar() {
    setErro('')
    setLoading(true)

    if (!pacienteId || !data || !hora) {
      setErro('Preencha paciente, data e hora.')
      setLoading(false)
      return
    }

    const agora = new Date()
    const dataHoraSelecionada = new Date(`${data}T${hora}:00`)
    if (dataHoraSelecionada <= agora) {
      setErro('Não é possível agendar consultas em datas ou horários passados.')
      setLoading(false)
      return
    }

    const servicoSelecionado = servicos.find(s => s.id === servicoId)
    const duracao = servicoSelecionado?.duration_minutes ?? 60
    const scheduledAt = new Date(`${data}T${hora}:00`).toISOString()

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pacienteId, servicoId, scheduledAt, duracao }),
    })

    const result = await res.json()

    if (!res.ok) {
      setErro(result.error || 'Erro ao criar consulta.')
      setLoading(false)
      return
    }

    router.push('/dashboard/agenda')
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/dashboard/agenda" className="text-sm hover:opacity-70" style={{ color: '#0F6E56' }}>← Voltar</Link>
        <h1 className="text-lg font-medium mt-2" style={{ color: 'var(--text-strong)' }}>Nova consulta</h1>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {erro && (
            <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
              {erro}
            </div>
          )}

          <div>
            <label style={labelStyle}>Paciente</label>
            <select value={pacienteId} onChange={e => setPacienteId(e.target.value)} style={inputStyle}>
              <option value="">Selecione um paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.name ?? p.phone}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Serviço</label>
            <select value={servicoId} onChange={e => setServicoId(e.target.value)} style={inputStyle}>
              <option value="">Selecione um serviço (opcional)</option>
              {servicos.map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Hora</label>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={inputStyle} />
          </div>

          <Button onClick={handleCriar} disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Salvando...' : 'Agendar consulta'}
          </Button>
        </div>
      </Card>
    </div>
  )
}