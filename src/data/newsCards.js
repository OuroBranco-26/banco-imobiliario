// Cartas de Notícias - Deck de cartas com efeitos variados
// Use {player} como placeholder para o nome do jogador
export const NEWS_CARDS = [
  // Ganhar dinheiro
  { id: 1, text: '🎉 {player}, festa junina em Araguari! Você ganhou $200 no bingo!', effect: { type: 'gainMoney', amount: 200 } },
  { id: 2, text: '💰 {player}, herança do seu tio-avô! Receba $150.', effect: { type: 'gainMoney', amount: 150 } },
  { id: 3, text: '🏆 {player} ganhou um concurso de receitas no Festival do Cerrado! Receba $100.', effect: { type: 'gainMoney', amount: 100 } },
  { id: 4, text: '🎵 {player}, o show de viola no Parque Bosque gerou lucro! Receba $50.', effect: { type: 'gainMoney', amount: 50 } },
  { id: 5, text: '🏦 {player}, erro bancário a seu favor! Receba $200.', effect: { type: 'gainMoney', amount: 200 } },
  
  // Perder dinheiro
  { id: 6, text: '🔧 {player}, seu telhado precisa de reforma! Pague $150.', effect: { type: 'loseMoney', amount: 150 } },
  { id: 7, text: '🏥 {player} foi parar na UPA! Pague $100 de consulta.', effect: { type: 'loseMoney', amount: 100 } },
  { id: 8, text: '📝 {player} levou multa de trânsito na Av. Minas Gerais! Pague $50.', effect: { type: 'loseMoney', amount: 50 } },
  { id: 9, text: '🎓 {player}, hora da matrícula escolar! Pague $200.', effect: { type: 'loseMoney', amount: 200 } },
  { id: 10, text: '💧 {player}, sua conta de água da SAE está atrasada! Pague $75.', effect: { type: 'loseMoney', amount: 75 } },

  // Movimento
  { id: 11, text: '🏃 {player}, avance até o Início e receba $500!', effect: { type: 'moveTo', position: 0, collectGo: true } },
  { id: 12, text: '🏖️ {player} ganhou férias forçadas! Vá para a casa de Férias.', effect: { type: 'moveTo', position: 20, collectGo: false } },
  { id: 13, text: '➡️ {player}, avance 3 casas!', effect: { type: 'moveForward', steps: 3 } },
  { id: 14, text: '⬅️ {player}, volte 3 casas!', effect: { type: 'moveBack', steps: 3 } },
  
  // Presídio
  { id: 15, text: '🚔 {player} foi flagrado em festa clandestina! Vá direto para o Presídio!', effect: { type: 'goToJail' } },
  
  // Coletar de todos
  { id: 16, text: '🎂 É aniversário de {player}! Cada jogador paga $50 para ele(a).', effect: { type: 'collectFromAll', amount: 50 } },
  { id: 17, text: '🏅 {player} foi eleito(a) prefeito(a) de Araguari! Cada jogador paga $25.', effect: { type: 'collectFromAll', amount: 25 } },
  
  // Pagar a todos
  { id: 18, text: '🍕 {player} paga uma pizza para todo mundo! Pague $50 a cada jogador.', effect: { type: 'payToAll', amount: 50 } },

  // === NOVAS CARTAS (19-40) ===

  // Ganhar dinheiro
  { id: 19, text: '🌽 {player}, sua barraca de milho na Festa do Peão fez sucesso! Receba $120.', effect: { type: 'gainMoney', amount: 120 } },
  { id: 20, text: '📦 {player} vendeu seu lote no bairro Bosque! Receba $300.', effect: { type: 'gainMoney', amount: 300 } },
  { id: 21, text: '🎰 {player}, sorte grande na rifa da igreja! Receba $80.', effect: { type: 'gainMoney', amount: 80 } },
  { id: 22, text: '💼 {player} recebeu uma promoção no trabalho! Bônus de $250.', effect: { type: 'gainMoney', amount: 250 } },
  { id: 23, text: '🚜 {player}, safra recorde na fazenda! Lucro de $180.', effect: { type: 'gainMoney', amount: 180 } },
  { id: 24, text: '🏪 {player}, seu comércio na Av. Batalhão rendeu bem! Receba $130.', effect: { type: 'gainMoney', amount: 130 } },

  // Perder dinheiro
  { id: 25, text: '🚗 {player} bateu o carro na rotatória do Centro! Pague $180 no conserto.', effect: { type: 'loseMoney', amount: 180 } },
  { id: 26, text: '🦷 {player} precisa de dentista de emergência! Pague $120.', effect: { type: 'loseMoney', amount: 120 } },
  { id: 27, text: '📱 {player} derrubou o celular no Rio Araguari! Compre outro por $250.', effect: { type: 'loseMoney', amount: 250 } },
  { id: 28, text: '🏠 {player}, goteira no seu telhado! Pague $90 para o encanador.', effect: { type: 'loseMoney', amount: 90 } },
  { id: 29, text: '⚡ {player}, conta de luz da CEMIG veio altíssima! Pague $110.', effect: { type: 'loseMoney', amount: 110 } },
  { id: 30, text: '🐶 O cachorro de {player} comeu o sofá! Pague $60 por um novo.', effect: { type: 'loseMoney', amount: 60 } },

  // Movimento
  { id: 31, text: '🚌 {player}, pegue o ônibus na Rodoviária! Vá para a casa 25.', effect: { type: 'moveTo', position: 25, collectGo: false } },
  { id: 32, text: '✈️ {player}, embarque no Aeroporto Araguari! Vá para a casa 5.', effect: { type: 'moveTo', position: 5, collectGo: false } },
  { id: 33, text: '🏃 {player} entrou na corrida de rua no Centro! Avance 5 casas.', effect: { type: 'moveForward', steps: 5 } },
  { id: 34, text: '🚧 {player}, obra na estrada! Volte 2 casas.', effect: { type: 'moveBack', steps: 2 } },

  // Presídio
  { id: 35, text: '🚨 {player} foi flagrado fazendo moto grau na Av. Minas Gerais! Vá para o Presídio!', effect: { type: 'goToJail' } },
  { id: 36, text: '📋 Mandado de busca para {player}! Vá direto para o Presídio!', effect: { type: 'goToJail' } },

  // Coletar/Pagar a todos
  { id: 37, text: '🎄 Natal em Araguari! Cada jogador dá um presente de $30 para {player}.', effect: { type: 'collectFromAll', amount: 30 } },
  { id: 38, text: '🍺 {player} paga uma rodada de cerveja para todo mundo! Pague $40 a cada.', effect: { type: 'payToAll', amount: 40 } },
  { id: 39, text: '🏆 O time de {player} ganhou o campeonato regional! Cada jogador paga $60.', effect: { type: 'collectFromAll', amount: 60 } },
  { id: 40, text: '🎪 {player} patrocina a Festa Junina de Araguari! Pague $80 a cada jogador.', effect: { type: 'payToAll', amount: 80 } },
];

// Shuffle utility
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
