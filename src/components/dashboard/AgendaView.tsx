'use client'

import { useState } from 'react'
import ConsultaActions from '@/components/dashboard/ConsultaActions'

interface Paciente {
  name: string | null
}

interface Servico {
  id: string
  name: string
}

interface Consulta {
  id: string
  scheduled_at: string
  status: string
  notes: string | null
  patients: Paciente | null
  services: Servico | null
}

interface Props {
  consultas: Consulta[]
  servicos: Servico[]
}

type Visualizacao = 'lista' | 'semanal' | 'mensal'
type Filtro = 'todos' | 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'

const statusCores: Record<string, string> = {
  agendado: 'bg-yellow-50 text-yellow-700',
  confirmado: 'bg-green-50 text-green-700',
  realizado: 'bg-blue-50 text-blue-700',
  faltou: 'bg-red-50 text-red-700',
  cancelado: 'bg-gray-100 text-gray-500',
}

function getNomeSemana(data: Date) {
  return data.toLocaleDateString('pt-BR', { weekday: 'short' })
}

function getInicioDaSemana(data: Date) {
  const d = new Date(data)
  const dia = d.getDay()
  d.setDate(d.getDate() - dia)
  return d
}

function getInicioDoMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), 1)
}

export default function AgendaView({ consultas, servicos }: Props) {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('lista')
  const [filtroStatus, setFiltroStatus] = useState<Filtro>('todos')
  const [filtroServico, setFiltroServico] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [busca, setBusca] = useState('')
  const [dataAtual, setDataAtual] = useState(new Date())

  const consultasFiltradas = consultas.filter(c => {
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    const matchBusca = busca === '' ||
      (c.patients?.name ?? '').toLowerCase().includes(busca.toLowerCase())
    const matchServico = filtroServico === '' || c.services?.id === filtroServico
    const dataConsulta = new Date(c.scheduled_at)
    const matchDataInicio = filtroDataInicio === '' || dataConsulta >= new Date(filtroDataInicio)
    const matchDataFim = filtroDataFim === '' || dataConsulta <= new Date(filtroDataFim + 'T23:59:59')
    return matchStatus && matchBusca && matchServico && matchDataInicio && matchDataFim
  })

  function navegar(direcao: number) {
    const nova = new Date(dataAtual)
    if (visualizacao === 'semanal') nova.setDate(nova.getDate() + direcao * 7)
    if (visualizacao === 'mensal') nova.setMonth(nova.getMonth() + direcao)
    setDataAtual(nova)
  }

  function getTitulo() {
    if (visualizacao === 'semanal') {
      const inicio = getInicioDaSemana(dataAtual)
      const fim = new Date(inicio)
      fim.setDate(fim.getDate() + 6)
      return `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    }
    if (visualizacao === 'mensal') {
      return dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }
    return 'Todas as consultas'
  }

  function renderLista() {
    if (consultasFiltradas.length === 0) {
      return <p className="px-5 py-8 text-sm text-center text-gray-400">Nenhuma consulta encontrada.</p>
    }
    return (
      <div className="divide-y divide-gray-100">
        {consultasFiltradas.map(consulta => (
          <div key={consulta.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{consulta.patients?.name ?? 'Paciente'}</p>
              <p className="text-xs text-gray-500">
                {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {consulta.services?.name && ` · ${consulta.services.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusCores[consulta.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {consulta.status}
              </span>
              <ConsultaActions consultaId={consulta.id} statusAtual={consulta.status} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderSemanal() {
    const inicio = getInicioDaSemana(dataAtual)
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(d.getDate() + i)
      return d
    })

    return (
      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {dias.map((dia, i) => {
          const consultasDia = consultasFiltradas.filter(c => {
            const d = new Date(c.scheduled_at)
            return d.toDateString() === dia.toDateString()
          })
          const hoje = dia.toDateString() === new Date().toDateString()

          return (
            <div key={i} className="min-h-32">
              <div className={`px-2 py-2 text-center border-b border-gray-100 ${hoje ? 'bg-blue-50' : ''}`}>
                <p className="text-xs text-gray-500 capitalize">{getNomeSemana(dia)}</p>
                <p className={`text-sm font-medium ${hoje ? 'text-blue-600' : ''}`}>{dia.getDate()}</p>
              </div>
              <div className="p-1 flex flex-col gap-1">
                {consultasDia.map(c => (
                  <div key={c.id} className={`text-xs px-1.5 py-1 rounded ${statusCores[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    <p className="font-medium truncate">{c.patients?.name ?? 'Paciente'}</p>
                    <p>{new Date(c.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function renderMensal() {
    const inicioMes = getInicioDoMes(dataAtual)
    const diasNoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate()
    const primeiroDiaSemana = inicioMes.getDay()
    const semanas = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const celulas = Array.from({ length: primeiroDiaSemana + diasNoMes }, (_, i) => {
      if (i < primeiroDiaSemana) return null
      return new Date(dataAtual.getFullYear(), dataAtual.getMonth(), i - primeiroDiaSemana + 1)
    })

    return (
      <div>
        <div className="grid grid-cols-7 border-b border-gray-100">
          {semanas.map(s => (
            <div key={s} className="px-2 py-2 text-center text-xs text-gray-500 font-medium">{s}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {celulas.map((dia, i) => {
            if (!dia) return <div key={i} className="min-h-20 bg-gray-50" />

            const consultasDia = consultasFiltradas.filter(c => {
              const d = new Date(c.scheduled_at)
              return d.toDateString() === dia.toDateString()
            })
            const hoje = dia.toDateString() === new Date().toDateString()

            return (
              <div key={i} className="min-h-20 p-1">
                <p className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${hoje ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                  {dia.getDate()}
                </p>
                <div className="flex flex-col gap-0.5">
                  {consultasDia.slice(0, 2).map(c => (
                    <div key={c.id} className={`text-xs px-1 py-0.5 rounded truncate ${statusCores[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {c.patients?.name ?? 'Paciente'}
                    </div>
                  ))}
                  {consultasDia.length > 2 && (
                    <p className="text-xs text-gray-400">+{consultasDia.length - 2}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['lista', 'semanal', 'mensal'] as Visualizacao[]).map(v => (
              <button
                key={v}
                onClick={() => setVisualizacao(v)}
                className={`text-xs px-3 py-1.5 rounded-md capitalize ${visualizacao === v ? 'bg-white text-gray-900 font-medium shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {v}
              </button>
            ))}
          </div>

          {visualizacao !== 'lista' && (
            <div className="flex items-center gap-2">
              <button onClick={() => navegar(-1)} className="text-sm px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">←</button>
              <span className="text-sm text-gray-600 min-w-48 text-center">{getTitulo()}</span>
              <button onClick={() => navegar(1)} className="text-sm px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">→</button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar paciente..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value as Filtro)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="todos">Todos os status</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="faltou">Faltou</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select
            value={filtroServico}
            onChange={e => setFiltroServico(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="">Todos os serviços</option>
            {servicos.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-gray-500 shrink-0">De</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={e => setFiltroDataInicio(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-gray-500 shrink-0">Até</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={e => setFiltroDataFim(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          {(filtroDataInicio || filtroDataFim || filtroStatus !== 'todos' || filtroServico || busca) && (
            <button
              onClick={() => { setFiltroDataInicio(''); setFiltroDataFim(''); setFiltroStatus('todos'); setFiltroServico(''); setBusca('') }}
              className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {visualizacao === 'lista' && renderLista()}
        {visualizacao === 'semanal' && renderSemanal()}
        {visualizacao === 'mensal' && renderMensal()}
      </div>
    </div>
  )
}