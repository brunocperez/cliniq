'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovoTenantPage() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [plano, setPlano] = useState('essencial')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [senhaGerada, setSenhaGerada] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function handleCriar() {
    setErro('')
    setLoading(true)

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, plano, email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao criar tenant.')
      setLoading(false)
      return
    }

    setSenhaGerada(data.senha)
    setLoading(false)
  }

  function handleCopiar() {
    navigator.clipboard.writeText(`E-mail: ${email}\nSenha: ${senhaGerada}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function handleBaixarPDF() {
    const conteudo = `
ClinicSaaS — Dados de Acesso
=============================
Consultório: ${nome}
E-mail: ${email}
Senha temporária: ${senhaGerada}

Acesse: ${window.location.origin}/login

Atenção: troque sua senha no primeiro acesso.
    `.trim()

    const blob = new Blob([conteudo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acesso-${nome.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (senhaGerada) {
    return (
      <div className="max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <h1 className="text-lg font-medium mb-1">Tenant criado com sucesso!</h1>
            <p className="text-sm text-gray-500">Credenciais de acesso do cliente:</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">E-mail</p>
              <p className="text-sm font-medium">{email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Senha temporária</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono flex-1">
                  {mostrarSenha ? senhaGerada : '••••••••••'}
                </p>
                <button
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 border border-gray-200 rounded"
                >
                  {mostrarSenha ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopiar}
              className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {copiado ? 'Copiado!' : 'Copiar credenciais'}
            </button>
            <button
              onClick={handleBaixarPDF}
              className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Baixar .txt
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mb-4">
            Um e-mail com as credenciais foi enviado para o cliente.
          </p>

          <button
            onClick={() => router.push('/admin')}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    )
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

        <p className="text-xs text-gray-400">
          Uma senha temporária será gerada e enviada por e-mail automaticamente.
        </p>

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