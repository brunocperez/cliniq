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
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-app)]">
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-8 w-full max-w-sm text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#E1F5EE' }}
        >
          <span style={{ color: '#0F6E56' }} className="text-xl">✕</span>
        </div>
        <h1 className="text-lg font-medium mb-2">Acesso bloqueado</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Sua conta foi suspensa. Entre em contato com o suporte para reativar o acesso.
        </p>
        <button
          onClick={handleVoltar}
          className="text-sm"
          style={{ color: '#0F6E56' }}
        >
          Voltar ao login
        </button>
      </div>
    </div>
  )
}