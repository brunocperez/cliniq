'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BloqueadoPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleVoltar() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">✕</span>
        </div>
        <h1 className="text-lg font-medium mb-2">Acesso bloqueado</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sua conta foi suspensa. Entre em contato com o suporte para reativar o acesso.
        </p>
        <button
          onClick={handleVoltar}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  )
}