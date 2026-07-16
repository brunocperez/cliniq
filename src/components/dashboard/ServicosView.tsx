'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Pencil } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import NovoServicoModal from '@/components/dashboard/NovoServicoModal'
import Button from '@/components/ui/Button'

interface Servico {
  id: string
  name: string
  duration_minutes: number
  price: number | null
  categoria: 'diagnostico' | 'tratamento'
  descricao: string | null
  status_aplicado: string | null
}

interface Props {
  servicos: Servico[]
}

export default function ServicosView({ servicos }: Props) {
  const router = useRouter()
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [loadingAcao, setLoadingAcao] = useState(false)
  const [mostrarModalNovo, setMostrarModalNovo] = useState(false)
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null)

  async function handleExcluir() {
    if (!excluindoId) return
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase
      .from('services')
      .delete()
      .eq('id', excluindoId)
    setExcluindoId(null)
    setLoadingAcao(false)
    router.refresh()
  }

  return (
    <div>
      {excluindoId && (
        <ConfirmModal
          mensagem="Excluir este serviço permanentemente? Esta ação não pode ser desfeita."
          onConfirmar={handleExcluir}
          onCancelar={() => setExcluindoId(null)}
        />
      )}

      {mostrarModalNovo && (
        <NovoServicoModal onFechar={() => setMostrarModalNovo(false)} />
      )}

      {servicoEditando && (
        <NovoServicoModal
          servico={servicoEditando}
          onFechar={() => setServicoEditando(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button size="sm" onClick={() => setMostrarModalNovo(true)}>
          + Novo serviço
        </Button>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-default)' }}>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Nome</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Tipo</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Duração</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Valor</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {servicos.length > 0 ? (
              servicos.map(servico => (
                <tr key={servico.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                  <td className="px-4 py-3" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{servico.name}</td>
                  <td className="px-4 py-3">
                    <span style={{
                      fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                      background: servico.categoria === 'diagnostico' ? 'var(--cliniq-50)' : 'var(--surface-sunken)',
                      color: servico.categoria === 'diagnostico' ? 'var(--brand)' : 'var(--text-muted)',
                      border: '1px solid var(--border-default)',
                    }}>
                      {servico.categoria === 'diagnostico' ? 'Diagnóstico' : 'Tratamento'}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{servico.duration_minutes} min</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {servico.price ? servico.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                  </td>
                  <td className="px-4 py-3" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setServicoEditando(servico)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 4, display: 'inline-flex', alignItems: 'center', marginRight: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setExcluindoId(servico.id)}
                      disabled={loadingAcao}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 4, display: 'inline-flex', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger-600)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-faint)' }}>
                  Nenhum serviço cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}