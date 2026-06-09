'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const especialidades = [
  'Odontologia',
  'Psicologia',
  'Fisioterapia',
  'Nutrição',
  'Fonoaudiologia',
  'Dermatologia',
  'Cardiologia',
  'Ortopedia',
  'Ginecologia',
  'Pediatria',
  'Clínica Geral',
  'Outra',
]

export default function EditarTenantPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [nomeConsultorio, setNomeConsultorio] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [whatsappConsultorio, setWhatsappConsultorio] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('')
  const [profileId, setProfileId] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function carregar() {
      const res = await fetch(`/api/tenants/${id}`)
      const data = await res.json()

      setNomeConsultorio(data.tenant?.name ?? '')
      setEspecialidade(data.tenant?.specialty ?? '')
      setWhatsappConsultorio(data.tenant?.whatsapp_consultorio ?? '')
      setNomeResponsavel(data.profile?.responsible_name ?? '')
      setWhatsappResponsavel(data.profile?.whatsapp_responsavel ?? '')
      setProfileId(data.profile?.id ?? '')
    }

    carregar()
  }, [id])

  async function handleSalvar() {
    setErro('')
    setLoading(true)

    const res = await fetch(`/api/tenants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeConsultorio,
        especialidade,
        whatsappConsultorio,
        nomeResponsavel,
        whatsappResponsavel,
        profileId,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao salvar.')
      setLoading(false)
      return
    }

    router.push(`/admin/tenants/${id}`)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <a href={`/admin/tenants/${id}`} className="text-sm text-gray-400 hover:text-gray-600">← Voltar</a>
        <h1 className="text-lg font-medium mt-2">Editar tenant</h1>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
          {erro}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium mb-4">Dados do consultório</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nome do consultório</label>
            <input
              type="text"
              value={nomeConsultorio}
              onChange={e => setNomeConsultorio(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Especialidade</label>
            <select
              value={especialidade}
              onChange={e => setEspecialidade(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            >
              <option value="">Selecione uma especialidade</option>
              {especialidades.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">WhatsApp do consultório</label>
            <input
              type="text"
              value={whatsappConsultorio}
              onChange={e => setWhatsappConsultorio(e.target.value)}
              placeholder="Ex: 11999999999"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium mb-4">Dados do responsável</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nome do responsável</label>
            <input
              type="text"
              value={nomeResponsavel}
              onChange={e => setNomeResponsavel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">WhatsApp do responsável</label>
            <input
              type="text"
              value={whatsappResponsavel}
              onChange={e => setWhatsappResponsavel(e.target.value)}
              placeholder="Ex: 11999999999"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSalvar}
        disabled={loading}
        className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  )
}