'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { inputStyle, labelStyle } from '@/lib/styles'

interface Servico {
  id: string
  name: string
  duration_minutes: number
}

interface Paciente {
  id: string
  name: string | null
  phone: string
}

interface Props {
  onFechar: () => void
}

export default function NovaConsultaModal({ onFechar }: Props) {
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
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from('services').select('id, name, duration_minutes'),
        supabase.from('patients').select('id, name, phone').eq('archived', false).order('name'),
      ])
      setServicos(s ?? [])
      setPacientes(p ?? [])
    }
    carregar()
  }, [])

  async function handleCriar() {
    setErro('')

    if (!pacienteId || !data || !hora) {
      setErro('Preencha paciente, data e hora.')
      return
    }

    const agora = new Date()
    const dataHoraSelecionada = new Date(`${data}T${hora}:00`)
    if (dataHoraSelecionada <= agora) {
      setErro('Não é possível agendar em datas ou horários passados.')
      return
    }

    setLoading(true)

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

    router.refresh()
    onFechar()
  }

  return (
    <Modal titulo="Nova consulta" onFechar={onFechar}>
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
          <label style={labelStyle}>Serviço (opcional)</label>
          <select value={servicoId} onChange={e => setServicoId(e.target.value)} style={inputStyle}>
            <option value="">Selecione um serviço</option>
            {servicos.map(s => (
              <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Hora</label>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
          <Button onClick={handleCriar} disabled={loading}>
            {loading ? 'Agendando...' : 'Agendar consulta'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}