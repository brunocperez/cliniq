'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Button from '@/components/ui/Button'

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
          style={{ fontFamily: 'var(--font-sans)' }}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => { setMostrarArquivados(!mostrarArquivados); setSelecionados([]) }}
          style={mostrarArquivados ? { background: '#F3F4F6', borderColor: '#111827', color: '#111827' } : {}}
        >
          {mostrarArquivados ? 'Ver ativos' : 'Ver arquivados'}
        </Button>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-app)', borderBottom: '1px solid var(--border-divider)' }}>
          <input
            type="checkbox"
            checked={selecionados.length === pacientesFiltrados.length && pacientesFiltrados.length > 0}
            onChange={toggleTodos}
            className="rounded"
          />
          {selecionados.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{selecionados.length} selecionado(s)</span>
              <Button variant="secondary" size="sm" onClick={handleArquivar} disabled={loadingAcao}>
                {mostrarArquivados ? 'Desarquivar' : 'Arquivar'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => setMostrarModalExcluir(true)} disabled={loadingAcao}>
                Excluir
              </Button>
            </div>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>Nome</span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-app)', borderBottom: '1px solid var(--border-default)' }}>
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>Nome</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>WhatsApp</th>
              <th className="text-left px-4 py-3" style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map(paciente => (
                <tr key={paciente.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(paciente.id)}
                      onChange={() => toggleSelecionado(paciente.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
                    <a href={`/dashboard/pacientes/${paciente.id}`} style={{ color: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}>
                      {paciente.name ?? '—'}
                    </a>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{paciente.phone}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                    {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--text-faint)' }}>
                  {mostrarArquivados ? 'Nenhum paciente arquivado.' : 'Nenhum paciente cadastrado ainda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}