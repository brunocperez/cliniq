'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  consultaId: string
  statusAtual: string
}

export default function ConsultaActions({ consultaId, statusAtual }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleStatus(novoStatus: string) {
    await supabase
      .from('appointments')
      .update({ status: novoStatus })
      .eq('id', consultaId)

    router.refresh()
  }

  if (statusAtual === 'realizado' || statusAtual === 'cancelado') {
    return <span className="text-xs text-gray-300">—</span>
  }

  return (
    <div className="flex gap-2">
      {statusAtual === 'agendado' && (
        <button
          onClick={() => handleStatus('confirmado')}
          className="text-xs px-3 py-1 rounded-full border border-green-200 text-green-600 hover:bg-green-50"
        >
          Confirmar
        </button>
      )}
      <button
        onClick={() => handleStatus('realizado')}
        className="text-xs px-3 py-1 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50"
      >
        Realizado
      </button>
      <button
        onClick={() => handleStatus('faltou')}
        className="text-xs px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
      >
        Faltou
      </button>
      <button
        onClick={() => handleStatus('cancelado')}
        className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        Cancelar
      </button>
    </div>
  )
}