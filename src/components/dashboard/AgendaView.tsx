'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import NovaConsultaModal from '@/components/dashboard/NovaConsultaModal'
import AgendaFiltros from '@/components/dashboard/agenda/AgendaFiltros'
import AgendaLista from '@/components/dashboard/agenda/AgendaLista'
import AgendaSemanal from '@/components/dashboard/agenda/AgendaSemanal'
import AgendaMensal from '@/components/dashboard/agenda/AgendaMensal'
import { Consulta, Servico, Visualizacao, Filtro } from '@/components/dashboard/agenda/types'

interface Props {
  consultas: Consulta[]
  servicos: Servico[]
  comModal?: boolean
}

function getInicioDaSemana(data: Date) {
  const d = new Date(data)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export default function AgendaView({ consultas, servicos, comModal = false }: Props) {
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
  const [mostrarModal, setMostrarModal] = useState(false)

  const consultasFiltradas = consultas.filter(c => {
    if (c.archived !== mostrarArquivados) return false
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    const matchBusca = busca === '' || (c.patients?.name ?? '').toLowerCase().includes(busca.toLowerCase())
    const matchServico = filtroServico === '' || c.services?.id === filtroServico
    const dataConsulta = new Date(c.scheduled_at)
    const matchDataInicio = filtroDataInicio === '' || dataConsulta >= new Date(filtroDataInicio)
    const matchDataFim = filtroDataFim === '' || dataConsulta <= new Date(filtroDataFim + 'T23:59:59')
    return matchStatus && matchBusca && matchServico && matchDataInicio && matchDataFim
  })

  function toggleSelecionado(id: string) {
    setSelecionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function toggleTodos() {
    if (selecionados.length === consultasFiltradas.length) setSelecionados([])
    else setSelecionados(consultasFiltradas.map(c => c.id))
  }

  async function handleArquivar() {
    if (selecionados.length === 0) return
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase.from('appointments').update({ archived: !mostrarArquivados }).in('id', selecionados)
    setSelecionados([])
    setLoadingAcao(false)
    router.refresh()
  }

  async function handleExcluir() {
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase.from('appointments').delete().in('id', selecionados)
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

  return (
    <div>
      {mostrarModalExcluir && (
        <ConfirmModal
          mensagem={`Excluir ${selecionados.length} consulta(s) permanentemente? Esta ação não pode ser desfeita.`}
          onConfirmar={handleExcluir}
          onCancelar={() => setMostrarModalExcluir(false)}
        />
      )}

      {mostrarModal && <NovaConsultaModal onFechar={() => setMostrarModal(false)} />}

      <AgendaFiltros
        visualizacao={visualizacao}
        setVisualizacao={v => { setVisualizacao(v); setSelecionados([]) }}
        mostrarArquivados={mostrarArquivados}
        setMostrarArquivados={v => { setMostrarArquivados(v); setSelecionados([]) }}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        filtroServico={filtroServico}
        setFiltroServico={setFiltroServico}
        filtroDataInicio={filtroDataInicio}
        setFiltroDataInicio={setFiltroDataInicio}
        filtroDataFim={filtroDataFim}
        setFiltroDataFim={setFiltroDataFim}
        servicos={servicos}
        titulo={getTitulo()}
        onNavegar={navegar}
        comModal={comModal}
        onAbrirModal={() => setMostrarModal(true)}
      />

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {visualizacao === 'lista' && (
          <AgendaLista
            consultas={consultasFiltradas}
            mostrarArquivados={mostrarArquivados}
            selecionados={selecionados}
            loadingAcao={loadingAcao}
            onToggleSelecionado={toggleSelecionado}
            onToggleTodos={toggleTodos}
            onArquivar={handleArquivar}
            onExcluir={() => setMostrarModalExcluir(true)}
          />
        )}
        {visualizacao === 'semanal' && (
          <AgendaSemanal consultas={consultasFiltradas} dataAtual={dataAtual} />
        )}
        {visualizacao === 'mensal' && (
          <AgendaMensal consultas={consultasFiltradas} dataAtual={dataAtual} />
        )}
      </div>
    </div>
  )
}