'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  consultaId: string
  notasIniciais: string | null
}

export default function ConsultaNotes({ consultaId, notasIniciais }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editando, setEditando] = useState(false)
  const [notas, setNotas] = useState(notasIniciais ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSalvar() {
    setLoading(true)

    await supabase
      .from('appointments')
      .update({ notes: notas })
      .eq('id', consultaId)

    setLoading(false)
    setEditando(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Notas</p>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {notas ? 'Editar' : '+ Adicionar'}
          </button>
        )}
      </div>

      {editando ? (
        <div>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={3}
            placeholder="Anotações da consulta..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSalvar}
              disabled={loading}
              className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => { setEditando(false); setNotas(notasIniciais ?? '') }}
              className="text-sm px-4 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {notas || 'Nenhuma nota registrada.'}
        </p>
      )}
    </div>
  )
}