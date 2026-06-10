'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <input
            type="checkbox"
            checked={selecionados.length === servicos.length && servicos.length > 0}
            onChange={toggleTodos}
            className="rounded"
          />
          {selecionados.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{selecionados.length} selecionado(s)</span>
              <button
                onClick={() => setMostrarModalExcluir(true)}
                disabled={loadingAcao}
                className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Duração</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length > 0 ? (
              servicos.map(servico => (
                <tr key={servico.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(servico.id)}
                      onChange={() => toggleSelecionado(servico.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{servico.name}</td>
                  <td className="px-4 py-3 text-gray-500">{servico.duration_minutes} min</td>
                  <td className="px-4 py-3 text-gray-500">
                    {servico.price
                      ? `R$ ${Number(servico.price).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
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