'use client'

import Button from '@/components/ui/Button'
import { Visualizacao, Filtro } from './types'

interface Servico {
  id: string
  name: string
}

interface Props {
  visualizacao: Visualizacao
  setVisualizacao: (v: Visualizacao) => void
  mostrarArquivados: boolean
  setMostrarArquivados: (v: boolean) => void
  busca: string
  setBusca: (v: string) => void
  filtroStatus: Filtro
  setFiltroStatus: (v: Filtro) => void
  filtroServico: string
  setFiltroServico: (v: string) => void
  filtroDataInicio: string
  setFiltroDataInicio: (v: string) => void
  filtroDataFim: string
  setFiltroDataFim: (v: string) => void
  servicos: Servico[]
  titulo: string
  onNavegar: (direcao: number) => void
  comModal: boolean
  onAbrirModal: () => void
}

const selectStyle = {
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  color: 'var(--text-body)',
  background: 'var(--surface-card)',
  cursor: 'pointer',
}

const inputStyle = {
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  color: 'var(--text-body)',
  background: 'var(--surface-card)',
}

export default function AgendaFiltros({
  visualizacao, setVisualizacao, mostrarArquivados, setMostrarArquivados,
  busca, setBusca, filtroStatus, setFiltroStatus, filtroServico, setFiltroServico,
  filtroDataInicio, setFiltroDataInicio, filtroDataFim, setFiltroDataFim,
  servicos, titulo, onNavegar, comModal, onAbrirModal
}: Props) {
  const temFiltro = filtroDataInicio || filtroDataFim || filtroStatus !== 'todos' || filtroServico || busca

  function limpar() {
    setFiltroDataInicio('')
    setFiltroDataFim('')
    setFiltroStatus('todos')
    setFiltroServico('')
    setBusca('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
      {/* Linha 1: visualizações + navegação + botão */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 4 }}>
            {(['lista', 'semanal', 'mensal'] as Visualizacao[]).map(v => (
              <button
                key={v}
                onClick={() => setVisualizacao(v)}
                style={{
                  fontSize: 'var(--text-xs)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  textTransform: 'capitalize',
                  fontWeight: visualizacao === v ? 'var(--weight-medium)' : 'var(--weight-regular)',
                  background: visualizacao === v ? 'var(--surface-card)' : 'transparent',
                  color: visualizacao === v ? 'var(--text-strong)' : 'var(--text-muted)',
                  boxShadow: visualizacao === v ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setMostrarArquivados(!mostrarArquivados) }}
            style={mostrarArquivados ? { borderColor: 'var(--text-strong)', color: 'var(--text-strong)' } : {}}
          >
            {mostrarArquivados ? 'Ver ativos' : 'Ver arquivados'}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {visualizacao !== 'lista' && (
            <>
              <button
                onClick={() => onNavegar(-1)}
                style={{ ...selectStyle, padding: '6px 10px' }}
              >←</button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', minWidth: 180, textAlign: 'center' }}>{titulo}</span>
              <button
                onClick={() => onNavegar(1)}
                style={{ ...selectStyle, padding: '6px 10px' }}
              >→</button>
            </>
          )}
          {comModal && (
            <Button size="sm" onClick={onAbrirModal}>+ Nova consulta</Button>
          )}
        </div>
      </div>

      {/* Linha 2: busca + selects */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar paciente..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as Filtro)} style={selectStyle}>
          <option value="todos">Todos os status</option>
          <option value="agendado">Agendado</option>
          <option value="confirmado">Confirmado</option>
          <option value="realizado">Realizado</option>
          <option value="faltou">Faltou</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select value={filtroServico} onChange={e => setFiltroServico(e.target.value)} style={selectStyle}>
          <option value="">Todos os serviços</option>
          {servicos.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Linha 3: datas */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>De</label>
          <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>Até</label>
          <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
        {temFiltro && (
          <button onClick={limpar} style={{ ...selectStyle, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Limpar
          </button>
        )}
      </div>
    </div>
  )
}