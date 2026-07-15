'use client'

import ConsultaActions from '@/components/dashboard/ConsultaActions'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { Consulta } from './types'

interface Props {
  consultas: Consulta[]
  mostrarArquivados: boolean
  selecionados: string[]
  loadingAcao: boolean
  onToggleSelecionado: (id: string) => void
  onToggleTodos: () => void
  onArquivar: () => void
  onExcluir: () => void
}

export default function AgendaLista({
  consultas, mostrarArquivados, selecionados, loadingAcao,
  onToggleSelecionado, onToggleTodos, onArquivar, onExcluir
}: Props) {
  if (consultas.length === 0) {
    return <p className="px-5 py-8 text-sm text-center text-[var(--text-faint)]">Nenhuma consulta encontrada.</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-divider)' }}>
        <input
          type="checkbox"
          checked={selecionados.length === consultas.length && consultas.length > 0}
          onChange={onToggleTodos}
          className="rounded"
        />
        {selecionados.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{selecionados.length} selecionado(s)</span>
            <Button variant="secondary" size="sm" onClick={onArquivar} disabled={loadingAcao}>
              {mostrarArquivados ? 'Desarquivar' : 'Arquivar'}
            </Button>
            <Button variant="danger" size="sm" onClick={onExcluir} disabled={loadingAcao}>
              Excluir
            </Button>
          </div>
        )}
      </div>
      <div className="divide-y divide-[var(--border-divider)]">
        {consultas.map(consulta => (
          <div key={consulta.id} className="px-5 py-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={selecionados.includes(consulta.id)}
              onChange={() => onToggleSelecionado(consulta.id)}
              className="rounded shrink-0"
            />
            <div className="flex-1 flex items-center justify-between">
              <div>
                
                <a
                  href={`/dashboard/agenda/${consulta.id}`}
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-strong)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-strong)')}
                >
                  {consulta.patients?.name ?? 'Paciente'}
                </a>
                <p className="text-xs text-[var(--text-muted)]">
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