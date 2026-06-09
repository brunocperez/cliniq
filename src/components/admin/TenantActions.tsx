'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
  tenantId: string
  isActive: boolean
}

export default function TenantActions({ tenantId, isActive }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [mostrarModal, setMostrarModal] = useState(false)

  async function handleToggle() {
    await supabase
      .from('tenants')
      .update({ is_active: !isActive })
      .eq('id', tenantId)

    setMostrarModal(false)
    router.refresh()
  }

  return (
    <>
      {mostrarModal && (
        <ConfirmModal
          mensagem={isActive
            ? 'Tem certeza que deseja bloquear este tenant?'
            : 'Tem certeza que deseja desbloquear este tenant?'
          }
          onConfirmar={handleToggle}
          onCancelar={() => setMostrarModal(false)}
        />
      )}
      <button
        onClick={() => setMostrarModal(true)}
        className={`text-xs px-3 py-1 rounded-full border ${
          isActive
            ? 'border-red-200 text-red-600 hover:bg-red-50'
            : 'border-green-200 text-green-600 hover:bg-green-50'
        }`}
      >
        {isActive ? 'Bloquear' : 'Desbloquear'}
      </button>
    </>
  )
}