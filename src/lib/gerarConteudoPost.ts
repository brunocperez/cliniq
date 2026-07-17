// -----------------------------------------------------------------------------
// Geração de conteúdo de post por IA a partir de uma IDEIA do dentista.
//
// ⚠️ VERSÃO MOCKADA: o dentista descreve a ideia, e a IA "gera" legenda + arte.
// No mock, devolvemos um conteúdo fake que incorpora a ideia recebida.
// Quando tiver a IA real, troca o corpo da função — o formato já está pronto.
// -----------------------------------------------------------------------------

export interface ConteudoPostIA {
  titulo: string
  legenda: string
  arteSugestao: string
}

// Frases fake que "envelopam" a ideia do dentista, pra simular a IA
// transformando uma ideia crua numa legenda profissional.
const ABERTURAS = [
  'Você sabia?',
  'Fica a dica! 🦷',
  'Cuidar do sorriso é cuidar da saúde. 💚',
  'Atenção para esse cuidado importante:',
]
const FECHAMENTOS = [
  'Agende sua avaliação! 📅 #saudebucal #odontologia',
  'Marque sua consulta e cuide do seu sorriso! 😁 #dentista #sorriso',
  'Fale com a gente e saiba mais! 💬 #saudebucal #prevenção',
]

// -----------------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — troque só o corpo quando tiver a IA real.
// A IA real recebe `ideia` e devolve legenda profissional + arte.
// -----------------------------------------------------------------------------
export async function gerarConteudoPost(ideia: string): Promise<ConteudoPostIA> {

  // ---- INÍCIO DO MOCK (remover quando plugar a IA real) ----
  await new Promise(resolve => setTimeout(resolve, 1500))

  const abertura = ABERTURAS[Math.floor(Math.random() * ABERTURAS.length)]
  const fechamento = FECHAMENTOS[Math.floor(Math.random() * FECHAMENTOS.length)]

  // "Melhora" a ideia crua do dentista numa legenda (fake)
  const ideiaLimpa = ideia.trim() || 'Cuidados com a saúde bucal'
  const titulo = ideiaLimpa.charAt(0).toUpperCase() + ideiaLimpa.slice(1)
  const legenda = `${abertura} ${ideiaLimpa}. ${fechamento}`
  const arteSugestao = `Arte ilustrando: ${ideiaLimpa}. Estilo clean, cores da clínica (verde-menta), imagem odontológica profissional.`

  return { titulo, legenda, arteSugestao }
  // ---- FIM DO MOCK ----

  // ---- QUANDO TIVER A IA REAL: ----
  // const resposta = await fetch('/api/gerar-post', {
  //   method: 'POST', headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ideia }),
  // })
  // return await resposta.json()   // { titulo, legenda, arteSugestao }
  //
  // (A IA de texto transforma a `ideia` numa legenda profissional; a IA de
  //  imagem gera a arte a partir da ideia — e da base de imagens do dentista,
  //  quando essa feature existir — e devolve a URL em arteSugestao.)
}