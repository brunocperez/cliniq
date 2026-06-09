'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function LogoutButton() {
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
        className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-400 text-left w-full"
      >
        Sair
      </button>
    </>
  )
}