'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Paciente {
  id: string
  name: string | null
  phone: string
  created_at: string
  archived: boolean
}

interface Props {
  pacientes: Paciente[]
}

export default function PacientesView({ pacientes }: Props) {
  const router = useRouter()
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [loadingAcao, setLoadingAcao] = useState(false)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
  const [busca, setBusca] = useState('')

  const pacientesFiltrados = pacientes.filter(p => {
    const matchArquivado = p.archived === mostrarArquivados
    const matchBusca = busca === '' ||
      (p.name ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      p.phone.includes(busca)
    return matchArquivado && matchBusca
  })

  function toggleSelecionado(id: string) {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function toggleTodos() {
    if (selecionados.length === pacientesFiltrados.length) {
      setSelecionados([])
    } else {
      setSelecionados(pacientesFiltrados.map(p => p.id))
    }
  }

  async function handleArquivar() {
    if (selecionados.length === 0) return
    setLoadingAcao(true)
    const supabase = createClient()
    await supabase
      .from('patients')
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
      .from('patients')
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
          mensagem={`Excluir ${selecionados.length} paciente(s) permanentemente? Esta ação não pode ser desfeita.`}
          onConfirmar={handleExcluir}
          onCancelar={() => setMostrarModalExcluir(false)}
        />
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          onClick={() => { setMostrarArquivados(!mostrarArquivados); setSelecionados([]) }}
          className={`text-xs px-3 py-2 rounded-lg border ${mostrarArquivados ? 'border-gray-900 text-gray-900 bg-gray-100' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          {mostrarArquivados ? 'Ver ativos' : 'Ver arquivados'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <input
            type="checkbox"
            checked={selecionados.length === pacientesFiltrados.length && pacientesFiltrados.length > 0}
            onChange={toggleTodos}
            className="rounded"
          />
          {selecionados.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{selecionados.length} selecionado(s)</span>
              <button
                onClick={handleArquivar}
                disabled={loadingAcao}
                className="text-xs px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-white"
              >
                {mostrarArquivados ? 'Desarquivar' : 'Arquivar'}
              </button>
              <button
                onClick={() => setMostrarModalExcluir(true)}
                disabled={loadingAcao}
                className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Nome</span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">WhatsApp</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map(paciente => (
                <tr key={paciente.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(paciente.id)}
                      onChange={() => toggleSelecionado(paciente.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <a href={`/dashboard/pacientes/${paciente.id}`} className="hover:text-blue-600">
                      {paciente.name ?? '—'}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{paciente.phone}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  {mostrarArquivados
                    ? 'Nenhum paciente arquivado.'
                    : 'Nenhum paciente cadastrado ainda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}