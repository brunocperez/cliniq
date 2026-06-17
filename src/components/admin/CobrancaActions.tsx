'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  cobrancaId: string
  tenantId: string
}

export default function CobrancaActions({ cobrancaId, tenantId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleMarcarPago() {
    setLoading(true)

    // 1. Marca a cobrança como paga
    await supabase
      .from('cobrancas')
      .update({ status: 'pago', pago_em: new Date().toISOString() })
      .eq('id', cobrancaId)

    // 2. Reativa o tenant, se estava bloqueado por inadimplência
    await supabase
      .from('tenants')
      .update({ is_active: true })
      .eq('id', tenantId)

    // 3. Aplica a alteração de pagamento pendente, se houver
    const { data: config } = await supabase
      .from('billing_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (config?.alteracao_pendente) {
      await supabase
        .from('billing_settings')
        .update({
          metodo_pagamento: config.proximo_metodo_pagamento ?? config.metodo_pagamento,
          dia_cobranca: config.proximo_dia_cobranca ?? config.dia_cobranca,
          proximo_metodo_pagamento: null,
          proximo_dia_cobranca: null,
          alteracao_pendente: false,
        })
        .eq('tenant_id', tenantId)
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <Button size="sm" onClick={handleMarcarPago} disabled={loading}>
      {loading ? 'Confirmando...' : 'Marcar como pago'}
    </Button>
  )
}