'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setErro('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm">

        <div className="mb-6">
          <Image src="/logo.svg" alt="Cliniq" width={120} height={36} />
        </div>

        <h1 className="text-lg font-medium mb-1">Gestão de consultório simplificada</h1>
        <p className="text-sm text-gray-500 mb-6">Entrar na sua conta</p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
            {erro}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs text-gray-500 mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: '#0F6E56' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

      </div>
    </div>
  )
}