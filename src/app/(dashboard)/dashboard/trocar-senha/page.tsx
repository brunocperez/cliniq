'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TrocarSenhaPage() {
  const supabase = createClient()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTrocar() {
    setErro('')

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro('Erro ao trocar senha.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('profiles')
      .update({ first_login: false })
      .eq('id', user?.id)

    await new Promise(resolve => setTimeout(resolve, 800))
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm">

        <h1 className="text-lg font-medium mb-1">Troque sua senha</h1>
        <p className="text-sm text-gray-500 mb-6">
          Por segurança, defina uma nova senha para o seu acesso.
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
            {erro}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Nova senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs text-gray-500 mb-1">Confirmar senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            placeholder="Repita a senha"
            onKeyDown={e => e.key === 'Enter' && handleTrocar()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <button
          onClick={handleTrocar}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Definir nova senha'}
        </button>

      </div>
    </div>
  )
}