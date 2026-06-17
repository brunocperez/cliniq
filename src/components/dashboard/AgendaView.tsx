'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConsultaActions from '@/components/dashboard/ConsultaActions'
import ConfirmModal from '@/components/ui/ConfirmModal'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'

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
  archived: boolean
  patients: Paciente | null
  services: Servico | null
}

interface Props {
  consultas: Consulta[]
  servicos: Servico[]
}

type Visualizacao = 'lista' | 'semanal' | 'mensal'
type Filtro = 'todos' | 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'

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
  const router = useRouter()
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('semanal')
  const [filtroStatus, setFiltroStatus] = useState<Filtro>('todos')
  const [filtroServico, setFiltroServico] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [busca, setBusca] = useState('')
  const [dataAtual, setDataAtual] = useState(new Date())
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [loadingAcao, setLoadingAcao] = useState(false)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)

  const consultasFiltradas = consultas.filter(c => {
    if (c.archived !== mostrarArquivados) return false
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    const matchBusca = busca === '' ||
      (c.patients?.name ?? '').toLowerCase().includes(busca.toLowerCase())
    const matchServico = filtroServico === '' || c.services?.id === filtroServico
    const dataConsulta = new Date(c.scheduled_at)
    const matchDataInicio = filtroDataInicio === '' || dataConsulta >= new Date(filtroDataInicio)
    const matchDataFim = filtroDataFim === '' || dataConsulta <= new Date(filtroDataFim + 'T23:59:59')
    return matchStatus && matchBusca && matchServico && matchDataInicio && matchDataFim
  })

  function toggleSelecionado(id: string) {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function toggleTodos() {
    if (selecionados.length === consultasFiltradas.length) {
      setSelecionados([])
    } else {
      setSelecionados(consultasFiltradas.map(c => c.id))
    }
  }

  async function handleArquivar() {
    if (selecionados.length === 0) return
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase
      .from('appointments')
      .update({ archived: !mostrarArquivados })
      .in('id', selecionados)
    setSelecionados([])
    setLoadingAcao(false)
    router.refresh()
  }

  async function handleExcluir() {
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase
      .from('appointments')
      .delete()
      .in('id', selecionados)
    setSelecionados([])
    setLoadingAcao(false)
    setMostrarModalExcluir(false)
    router.refresh()
  }

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
      <div>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <input
            type="checkbox"
            checked={selecionados.length === consultasFiltradas.length && consultasFiltradas.length > 0}
            onChange={toggleTodos}
            className="rounded"
          />
          {selecionados.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{selecionados.length} selecionado(s)</span>
              <Button variant="secondary" size="sm" onClick={handleArquivar} disabled={loadingAcao}>
                {mostrarArquivados ? 'Desarquivar' : 'Arquivar'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => setMostrarModalExcluir(true)} disabled={loadingAcao}>
                Excluir
              </Button>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {consultasFiltradas.map(consulta => (
            <div key={consulta.id} className="px-5 py-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selecionados.includes(consulta.id)}
                onChange={() => toggleSelecionado(consulta.id)}
                className="rounded shrink-0"
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <a href={`/dashboard/agenda/${consulta.id}`} className="text-sm font-medium hover:text-blue-600">
                    {consulta.patients?.name ?? 'Paciente'}
                  </a>
                  <p className="text-xs text-gray-500">
                    {new Date(consulta.scheduled_at).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {consulta.services?.name && ` · ${consulta.services.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={consulta.status as 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'} />
                  {!mostrarArquivados && (
                    <ConsultaActions consultaId={consulta.id} statusAtual={consulta.status} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid var(--border-divider)' }}>
        {dias.map((dia, i) => {
          const consultasDia = consultasFiltradas.filter(c => {
            const d = new Date(c.scheduled_at)
            return d.toDateString() === dia.toDateString()
          })
          const hoje = dia.toDateString() === new Date().toDateString()

          return (
            <div key={i} style={{ minHeight: 128, borderRight: i < 6 ? '1px solid var(--border-divider)' : 'none' }}>
              <div style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--border-divider)', background: hoje ? 'var(--cliniq-50)' : 'transparent' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{getNomeSemana(dia)}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: hoje ? 'var(--brand)' : 'var(--text-body)' }}>{dia.getDate()}</p>
              </div>
              <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {consultasDia.map(c => (
                  <a key={c.id} href={`/dashboard/agenda/${c.id}`} style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, background: 'var(--' + c.status + '-fill)', color: 'var(--' + c.status + '-ink)', display: 'block', opacity: 1 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <p style={{ margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.patients?.name ?? 'Paciente'}</p>
                    <p style={{ margin: 0 }}>{new Date(c.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </a>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-divider)' }}>
          {semanas.map(s => (
            <div key={s} style={{ padding: '8px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>{s}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {celulas.map((dia, i) => {
            if (!dia) return <div key={i} style={{ minHeight: 80, background: 'var(--surface-app)', borderRight: '1px solid var(--border-divider)', borderBottom: '1px solid var(--border-divider)' }} />

            const consultasDia = consultasFiltradas.filter(c => {
              const d = new Date(c.scheduled_at)
              return d.toDateString() === dia.toDateString()
            })
            const hoje = dia.toDateString() === new Date().toDateString()

            return (
              <div key={i} style={{ minHeight: 80, padding: 4, borderRight: '1px solid var(--border-divider)', borderBottom: '1px solid var(--border-divider)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: hoje ? 'var(--brand)' : 'transparent', color: hoje ? 'white' : 'var(--text-body)' }}>
                  {dia.getDate()}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {consultasDia.slice(0, 2).map(c => (
                    <a key={c.id} href={`/dashboard/agenda/${c.id}`} style={{ fontSize: 10, padding: '2px 4px', borderRadius: 4, background: 'var(--' + c.status + '-fill)', color: 'var(--' + c.status + '-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {c.patients?.name ?? 'Paciente'}
                    </a>
                  ))}
                  {consultasDia.length > 2 && (
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text-faint)' }}>+{consultasDia.length - 2}</p>
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
      {mostrarModalExcluir && (
        <ConfirmModal
          mensagem={`Excluir ${selecionados.length} consulta(s) permanentemente? Esta ação não pode ser desfeita.`}
          onConfirmar={handleExcluir}
          onCancelar={() => setMostrarModalExcluir(false)}
        />
      )}

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setMostrarArquivados(!mostrarArquivados); setSelecionados([]) }}
              style={mostrarArquivados ? { background: '#F3F4F6', borderColor: '#111827', color: '#111827' } : {}}
            >
              {mostrarArquivados ? 'Ver ativos' : 'Ver arquivados'}
            </Button>
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