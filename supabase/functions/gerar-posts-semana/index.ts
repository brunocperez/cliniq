import { createClient } from 'npm:@supabase/supabase-js@2'

const TEMAS_FAKE = [
  { titulo: 'A importância do fio dental', ideia: 'uso diário do fio dental' },
  { titulo: 'Clareamento dental profissional', ideia: 'benefícios do clareamento seguro' },
  { titulo: 'Quando trocar a escova de dente', ideia: 'troca da escova a cada 3 meses' },
  { titulo: 'Sensibilidade nos dentes', ideia: 'causas da sensibilidade dental' },
  { titulo: 'Check-up semestral', ideia: 'importância da avaliação a cada 6 meses' },
]

function gerarConteudoFake(ideia: string) {
  const legenda = `Você sabia? ${ideia}. Agende sua avaliação! #saudebucal #odontologia`
  const arteSugestao = `Arte ilustrando: ${ideia}. Estilo clean, cores da clínica.`
  return { legenda, arteSugestao }
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const inicioSemana = new Date()
  const diaSemana = inicioSemana.getDay()
  const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
  inicioSemana.setDate(inicioSemana.getDate() + diffParaSegunda)
  inicioSemana.setHours(0, 0, 0, 0)

  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, meta_posts_semana')
    .eq('is_active', true)

  if (tenantsError) {
    return new Response(JSON.stringify({ error: tenantsError.message }), { status: 500 })
  }

  const resultados = []

  for (const tenant of tenants ?? []) {
    const meta = tenant.meta_posts_semana ?? 5

    const { count } = await supabase
      .from('posts_marketing')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .gte('criado_em', inicioSemana.toISOString())

    const existentes = count ?? 0
    const faltam = meta - existentes

    if (faltam <= 0) {
      resultados.push({ tenant_id: tenant.id, gerados: 0 })
      continue
    }

    let gerados = 0
    for (let i = 0; i < faltam; i++) {
      const tema = TEMAS_FAKE[Math.floor(Math.random() * TEMAS_FAKE.length)]
      const conteudo = gerarConteudoFake(tema.ideia)

      const { error: insertError } = await supabase.from('posts_marketing').insert({
        tenant_id: tenant.id,
        titulo: tema.titulo,
        pauta: tema.ideia,
        legenda: conteudo.legenda,
        arte_sugestao: conteudo.arteSugestao,
        tipo: 'feed',
        status: 'rascunho',
        prioridade: 'normal',
        origem: 'ia',
      })

      if (!insertError) gerados++
    }

    resultados.push({ tenant_id: tenant.id, gerados })
  }

  return new Response(JSON.stringify({ processados: resultados.length, resultados }), {
    headers: { 'Content-Type': 'application/json' },
  })
})