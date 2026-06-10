'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NovoServicoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nome, setNome] = useState('')
  const [duracao, setDuracao] = useState('60')
  const [preco, setPreco] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCriar() {
    setErro('')
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .single()

    const { error } = await supabase
      .from('services')
      .insert({
        tenant_id: profile?.tenant_id,
        name: nome,
        duration_minutes: parseInt(duracao),
        price: preco ? parseFloat(preco) : null,
      })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/servicos')
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/dashboard/servicos" className="text-sm text-gray-400 hover:text-gray-600">← Voltar</Link>
        <h1 className="text-lg font-medium mt-2">Novo serviço</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">Nome do serviço</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Consulta inicial"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Duração (minutos)</label>
          <input
            type="number"
            value={duracao}
            onChange={e => setDuracao(e.target.value)}
            placeholder="60"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Valor (R$)</label>
          <input
            type="number"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            placeholder="150.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <button
          onClick={handleCriar}
          disabled={loading}
          className="w-full text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 mt-2"
          style={{ backgroundColor: '#0F6E56' }}
        >
          {loading ? 'Salvando...' : 'Salvar serviço'}
        </button>

      </div>
    </div>
  )
}