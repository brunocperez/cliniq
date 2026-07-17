// -----------------------------------------------------------------------------
// Geração de conteúdo de post por IA (pauta → legenda → sugestão de arte).
//
// ⚠️ VERSÃO MOCKADA: devolve conteúdo FAKE pra testar o fluxo sem API paga.
// Quando tiver a IA real (texto + geração de imagem), troca o corpo da função
// `gerarConteudoPost` — o formato de entrada/saída já está pronto e o resto
// do sistema não muda.
// -----------------------------------------------------------------------------

// O que a IA devolve pra um post
export interface ConteudoPostIA {
  titulo: string
  pauta: string
  legenda: string
  arteSugestao: string   // descrição da arte (vira URL quando gerar imagem real)
}

// Temas fake variados, pra simular respostas diferentes a cada geração
const CONTEUDOS_FAKE: ConteudoPostIA[] = [
  {
    titulo: 'A importância do fio dental',
    pauta: 'Educar sobre o uso diário do fio dental e como ele previne cáries entre os dentes.',
    legenda: 'Escovar não é suficiente! 🦷 O fio dental alcança onde a escova não chega e remove a placa entre os dentes. Use todos os dias e previna cáries e gengivite. Agende sua avaliação! 📅 #saudebucal #fiodental #dentista',
    arteSugestao: 'Imagem close-up de um fio dental sendo usado, fundo clean em tons de verde-menta, com destaque para o espaço entre os dentes.',
  },
  {
    titulo: 'Clareamento dental: vale a pena?',
    pauta: 'Explicar os benefícios do clareamento profissional vs caseiro e reforçar segurança.',
    legenda: 'Sonha com um sorriso mais branco? ✨ O clareamento profissional é seguro, eficaz e feito sob supervisão. Nada de receitas caseiras que danificam o esmalte! Venha conversar com a gente. 😁 #clareamentodental #sorriso #odontologia',
    arteSugestao: 'Antes e depois de um sorriso, split screen, iluminação suave, destaque para o brilho dos dentes.',
  },
  {
    titulo: 'Quando trocar a escova de dente',
    pauta: 'Orientar sobre a troca da escova a cada 3 meses e sinais de desgaste.',
    legenda: 'Sua escova tem mais de 3 meses? 🪥 É hora de trocar! Cerdas desgastadas limpam menos e acumulam bactérias. Dica: troque também após uma gripe. Cuide do seu sorriso! 💚 #escovacao #dicasdentais #prevenção',
    arteSugestao: 'Comparação visual de uma escova nova e uma desgastada, lado a lado, fundo minimalista.',
  },
  {
    titulo: 'Sensibilidade nos dentes',
    pauta: 'Falar sobre causas da sensibilidade dental e quando procurar o dentista.',
    legenda: 'Dói ao tomar algo gelado ou quente? ❄️🔥 A sensibilidade pode indicar esmalte desgastado, retração da gengiva ou cáries. Não ignore! Agende uma avaliação e descubra a causa. #sensibilidadedental #saudebucal',
    arteSugestao: 'Pessoa segurando a bochecha com expressão de desconforto ao tomar sorvete, tom acolhedor.',
  },
]

// -----------------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — troque só o corpo quando tiver a IA real.
// -----------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function gerarConteudoPost(tema?: string): Promise<ConteudoPostIA> {

  // ---- INÍCIO DO MOCK (remover quando plugar a IA real) ----
  // Simula o tempo de processamento da IA
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Devolve um conteúdo aleatório da lista fake
  const escolhido = CONTEUDOS_FAKE[Math.floor(Math.random() * CONTEUDOS_FAKE.length)]
  return escolhido
  // ---- FIM DO MOCK ----

  // ---- QUANDO TIVER A IA REAL, o corpo será algo como: ----
  //
  // const resposta = await fetch('/api/gerar-post', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ tema }),
  // })
  // const dados = await resposta.json()
  // return dados   // { titulo, pauta, legenda, arteSugestao }
  //
  // (a chamada real fica numa rota de API no servidor pra proteger a chave.
  //  A IA de texto gera titulo/pauta/legenda; a de imagem gera a arte e
  //  devolve uma URL, que substitui a descrição em arteSugestao.)
}