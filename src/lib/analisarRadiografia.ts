// -----------------------------------------------------------------------------
// Análise de radiografia por IA.
//
// ⚠️ VERSÃO MOCKADA: por enquanto devolve achados FAKE, pra testar o fluxo
// inteiro sem depender de API paga. Quando tiver acesso à API de IA (ex:
// Anthropic Claude com visão), é só substituir o corpo da função
// `analisarRadiografia` pela chamada real — o FORMATO de entrada e saída
// já está definido e o resto do sistema não precisa mudar.
// -----------------------------------------------------------------------------

import type { Face, StatusFace } from '@/components/dashboard/OdontogramaDetalheModal'

// Um achado = uma marcação que a IA sugere para um dente
export interface AchadoIA {
  dente: number
  face: Face
  status: StatusFace
  confianca: number   // 0 a 1 (ex: 0.92 = 92%)
}

// Formato do que a função recebe (a imagem) e devolve
export interface ResultadoAnaliseIA {
  achados: AchadoIA[]
}

// -----------------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — troque só o corpo dela quando tiver a API real.
// -----------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analisarRadiografia(imagemBase64: string): Promise<ResultadoAnaliseIA> {

  // ---- INÍCIO DO MOCK (remover quando plugar a IA real) ----
  // Simula o tempo de processamento da IA (2 segundos)
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Achados fake — variados, pra testar a tela de aprovação
  const achadosFake: AchadoIA[] = [
    { dente: 16, face: 'oclusal', status: 'cariado', confianca: 0.92 },
    { dente: 26, face: 'mesial', status: 'cariado', confianca: 0.78 },
    { dente: 36, face: 'oclusal', status: 'restaurado', confianca: 0.95 },
    { dente: 47, face: 'distal', status: 'canal', confianca: 0.63 },
    { dente: 21, face: 'vestibular', status: 'cariado', confianca: 0.55 },
  ]

  return { achados: achadosFake }
  // ---- FIM DO MOCK ----

  // ---- QUANDO TIVER A IA REAL, o corpo será algo como: ----
  //
  // const resposta = await fetch('/api/analisar-radiografia', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ imagem: imagemBase64 }),
  // })
  // const dados = await resposta.json()
  // return { achados: dados.achados }
  //
  // (a chamada real da IA fica numa rota de API no servidor, nunca no cliente,
  //  pra não expor a chave da API. A rota manda a imagem pro modelo de visão,
  //  recebe os achados e devolve nesse mesmo formato.)
}