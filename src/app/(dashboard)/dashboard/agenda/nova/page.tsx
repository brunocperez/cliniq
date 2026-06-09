'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .single()

      const { data: s } = await supabase
        .from('services')
        .select('id, name, duration_minutes')
        .eq('tenant_id', profile?.tenant_id)

      const { data: p } = await supabase
        .from('patients')
        .select('id, name, phone')
        .eq('tenant_id', profile?.tenant_id)

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

    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single()

    const scheduledAt = new Date(`${data}T${hora}:00`).toISOString()

    // Busca duração do serviço selecionado
    const servicoSelecionado = servicos.find(s => s.id === servicoId)
    const duracao = servicoSelecionado?.duration_minutes ?? 60

    // Calcula fim da nova consulta
    const novoInicio = new Date(scheduledAt)
    const novoFim = new Date(novoInicio.getTime() + duracao * 60000)

    // Busca consultas no mesmo dia
    const inicioDia = new Date(`${data}T00:00:00`).toISOString()
    const fimDia = new Date(`${data}T23:59:59`).toISOString()

    const { data: consultasExistentes } = await supabase
      .from('appointments')
      .select('scheduled_at, services(duration_minutes)')
      .eq('tenant_id', profile?.tenant_id)
      .gte('scheduled_at', inicioDia)
      .lte('scheduled_at', fimDia)
      .not('status', 'in', '("cancelado","faltou")')

    // Verifica conflito de horário
    const temConflito = consultasExistentes?.some(c => {
      const existenteInicio = new Date(c.scheduled_at)
      const duracaoExistente = (c.services as unknown as { duration_minutes: number } | null)?.duration_minutes ?? 60
      const existenteFim = new Date(existenteInicio.getTime() + duracaoExistente * 60000)

      return novoInicio < existenteFim && novoFim > existenteInicio
    })

    if (temConflito) {
      setErro('Já existe uma consulta neste horário. Escolha outro horário.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('appointments')
      .insert({
        tenant_id: profile?.tenant_id,
        patient_id: pacienteId,
        service_id: servicoId || null,
        scheduled_at: scheduledAt,
        status: 'agendado',
      })

    if (error) {
      setErro('Erro ao criar consulta.')
      setLoading(false)
      return
    }

    router.push('/dashboard/agenda')
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <a href="/dashboard/agenda" className="text-sm text-gray-400 hover:text-gray-600">← Voltar</a>
        <h1 className="text-lg font-medium mt-2">Nova consulta</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">Paciente</label>
          <select
            value={pacienteId}
            onChange={e => setPacienteId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="">Selecione um paciente</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Serviço</label>
          <select
            value={servicoId}
            onChange={e => setServicoId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="">Selecione um serviço (opcional)</option>
            {servicos.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.duration_minutes} min
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Data</label>
          <input
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Hora</label>
          <input
            type="time"
            value={hora}
            onChange={e => setHora(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <button
          onClick={handleCriar}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 mt-2"
        >
          {loading ? 'Salvando...' : 'Agendar consulta'}
        </button>

      </div>
    </div>
  )
}