'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  pacienteId: string
  notasIniciais: string | null
}

export default function PacienteNotes({ pacienteId, notasIniciais }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [editando, setEditando] = useState(false)
  const [notas, setNotas] = useState(notasIniciais ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSalvar() {
    setLoading(true)

    await supabase
      .from('patients')
      .update({ notes: notas })
      .eq('id', pacienteId)

    setLoading(false)
    setEditando(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">Observações</h2>
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
            rows={4}
            placeholder="Adicione observações sobre o paciente..."
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
          {notas || 'Nenhuma observação registrada.'}
        </p>
      )}
    </div>
  )
}