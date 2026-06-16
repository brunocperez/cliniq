'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Button from '@/components/ui/Button'

interface Servico {
  id: string
  name: string
  duration_minutes: number
  price: number | null
}

interface Props {
  servicos: Servico[]
}

export default function ServicosView({ servicos }: Props) {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [loadingAcao, setLoadingAcao] = useState(false)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)

  function toggleSelecionado(id: string) {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function toggleTodos() {
    if (selecionados.length === servicos.length) {
      setSelecionados([])
    } else {
      setSelecionados(servicos.map(s => s.id))
    }
  }

  async function handleExcluir() {
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase
      .from('services')
      .delete()
      .in('id', selecionados)
    setSelecionados([])
    setLoadingAcao(false)
    setMostrarModalExcluir(false)
    router.refresh()
  }

  return (
    <div>
      {mostrarModalExcluir && (
        <ConfirmModal
          mensagem={`Excluir ${selecionados.length} serviço(s) permanentemente? Esta ação não pode ser desfeita.`}
          onConfirmar={handleExcluir}
          onCancelar={() => setMostrarModalExcluir(false)}
        />
      )}

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-app)', borderBottom: '1px solid var(--border-divider)' }}>
          <input
            type="checkbox"
            checked={selecionados.length === servicos.length && servicos.length > 0}
            onChange={toggleTodos}
            className="rounded"
          />
          {selecionados.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{selecionados.length} selecionado(s)</span>
              <Button variant="danger" size="sm" onClick={() => setMostrarModalExcluir(true)} disabled={loadingAcao}>
                Excluir
              </Button>
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-app)', borderBottom: '1px solid var(--border-default)' }}>
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Nome</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Duração</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length > 0 ? (
              servicos.map(servico => (
                <tr key={servico.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(servico.id)}
                      onChange={() => toggleSelecionado(servico.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{servico.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{servico.duration_minutes} min</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                    {servico.price ? `R$ ${Number(servico.price).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--text-faint)' }}>
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