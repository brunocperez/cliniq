'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tenantId: string
  isActive: boolean
}

export default function TenantActions({ tenantId, isActive }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle() {
    await supabase
      .from('tenants')
      .update({ is_active: !isActive })
      .eq('id', tenantId)

    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      className={`text-xs px-3 py-1 rounded-full border ${
        isActive
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-green-200 text-green-600 hover:bg-green-50'
      }`}
    >
      {isActive ? 'Bloquear' : 'Desbloquear'}
    </button>
  )
}