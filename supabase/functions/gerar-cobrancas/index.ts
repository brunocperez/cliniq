import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function gerarCodigoPixFake(valor: number, tenantId: string) {
  const timestamp = Date.now()
  return `00020126580014BR.GOV.BCB.PIX0136${tenantId.slice(0, 8)}-FAKE-${timestamp}5204000053039865802BR5913CLINIQ TESTE6009SAO PAULO62070503***6304${Math.floor(valor * 100)}`
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const hoje = new Date()
  const diaHoje = hoje.getDate()

  // Busca configs de pagamento cujo dia de cobrança é hoje
  const { data: configs, error: configError } = await supabase
    .from('billing_settings')
    .select('*, tenants(id, plano, is_active)')
    .eq('dia_cobranca', diaHoje)

  if (configError) {
    return new Response(JSON.stringify({ error: configError.message }), { status: 500 })
  }

  const resultados = []

  for (const config of configs ?? []) {
    const tenant = config.tenants as { id: string; plano: string; is_active: boolean } | null
    if (!tenant || tenant.plano === 'trial' || !tenant.is_active) continue

    const valor = 99.00
    const vencimento = new Date(hoje)
    vencimento.setDate(vencimento.getDate() + 5) // 5 dias para pagar

    const codigoPix = config.metodo_pagamento === 'pix'
      ? gerarCodigoPixFake(valor, tenant.id)
      : null

    const { error: insertError } = await supabase
      .from('cobrancas')
      .insert({
        tenant_id: tenant.id,
        valor,
        metodo: config.metodo_pagamento,
        status: 'pendente',
        codigo_pix: codigoPix,
        vencimento: vencimento.toISOString(),
      })

    resultados.push({ tenant_id: tenant.id, sucesso: !insertError })
  }

  // Marca como vencido e bloqueia tenants com cobrança pendente vencida
  const { data: cobrancasVencidas } = await supabase
    .from('cobrancas')
    .select('id, tenant_id')
    .eq('status', 'pendente')
    .lt('vencimento', hoje.toISOString())

  for (const cobranca of cobrancasVencidas ?? []) {
    await supabase.from('cobrancas').update({ status: 'vencido' }).eq('id', cobranca.id)
    await supabase.from('tenants').update({ is_active: false }).eq('id', cobranca.tenant_id)
  }

  return new Response(JSON.stringify({ processados: resultados.length, bloqueados: cobrancasVencidas?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})