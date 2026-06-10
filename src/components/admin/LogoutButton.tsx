'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
  expandido: boolean
}

export default function LogoutButton({ expandido }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [mostrarModal, setMostrarModal] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {mostrarModal && (
        <ConfirmModal
          mensagem="Tem certeza que deseja sair?"
          onConfirmar={handleLogout}
          onCancelar={() => setMostrarModal(false)}
        />
      )}
      <button
        onClick={() => setMostrarModal(true)}
        title={expandido ? undefined : 'Sair'}
        className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-white/10 transition-colors"
        style={{
          color: 'rgba(255,255,255,0.7)',
          justifyContent: expandido ? 'flex-start' : 'center',
        }}
      >
        <LogOut size={18} style={{ flexShrink: 0 }} />
        {expandido && <span className="text-sm">Sair</span>}
      </button>
    </>
  )
}