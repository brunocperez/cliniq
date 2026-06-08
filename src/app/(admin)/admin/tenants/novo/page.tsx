'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovoTenantPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [plano, setPlano] = useState('essencial')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCriar() {
  setErro('')
  setLoading(true)

  const res = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, plano, email, senha }),
  })

  const data = await res.json()

  if (!res.ok) {
    setErro(data.error || 'Erro ao criar tenant.')
    setLoading(false)
    return
  }

  router.push('/admin')
}

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <a href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Voltar</a>
        <h1 className="text-lg font-medium mt-2">Novo tenant</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">Nome do consultório</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Clínica Dra. Ana"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Plano</label>
          <select
            value={plano}
            onChange={e => setPlano(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="essencial">Essencial</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">E-mail de acesso</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="cliente@email.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Senha inicial</label>
          <input
            type="text"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <button
          onClick={handleCriar}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 mt-2"
        >
          {loading ? 'Criando...' : 'Criar tenant'}
        </button>

      </div>
    </div>
  )
}