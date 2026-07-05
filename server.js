import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// === GAME DATA (imported inline to avoid ESM issues) ===
const NEWS_CARDS = [
  { id: 1, text: '🎉 {player}, festa junina em Araguari! Você ganhou $200 no bingo!', effect: { type: 'gainMoney', amount: 200 } },
  { id: 2, text: '💰 {player}, herança do seu tio-avô! Receba $150.', effect: { type: 'gainMoney', amount: 150 } },
  { id: 3, text: '🏆 {player} ganhou um concurso de receitas no Festival do Cerrado! Receba $100.', effect: { type: 'gainMoney', amount: 100 } },
  { id: 4, text: '🎵 {player}, o show de viola no Parque Bosque gerou lucro! Receba $50.', effect: { type: 'gainMoney', amount: 50 } },
  { id: 5, text: '🏦 {player}, erro bancário a seu favor! Receba $200.', effect: { type: 'gainMoney', amount: 200 } },
  { id: 6, text: '🔧 {player}, seu telhado precisa de reforma! Pague $150.', effect: { type: 'loseMoney', amount: 150 } },
  { id: 7, text: '🏥 {player} foi parar na UPA! Pague $100 de consulta.', effect: { type: 'loseMoney', amount: 100 } },
  { id: 8, text: '📝 {player} levou multa de trânsito na Av. Minas Gerais! Pague $50.', effect: { type: 'loseMoney', amount: 50 } },
  { id: 9, text: '🎓 {player}, hora da matrícula escolar! Pague $200.', effect: { type: 'loseMoney', amount: 200 } },
  { id: 10, text: '💧 {player}, sua conta de água da SAE está atrasada! Pague $75.', effect: { type: 'loseMoney', amount: 75 } },
  { id: 11, text: '🚀 {player}, avance até o Início e receba $500!', effect: { type: 'moveTo', position: 0, collectGo: true } },
  { id: 12, text: '🏖️ {player} ganhou férias forçadas! Vá para a casa de Férias.', effect: { type: 'moveTo', position: 20, collectGo: false } },
  { id: 13, text: '➡️ {player}, avance 3 casas!', effect: { type: 'moveForward', steps: 3 } },
  { id: 14, text: '⬅️ {player}, volte 3 casas!', effect: { type: 'moveBack', steps: 3 } },
  { id: 15, text: '🚔 {player} foi flagrado em festa clandestina! Vá direto para a Prisão!', effect: { type: 'goToJail' } },
  { id: 16, text: '🎂 É aniversário de {player}! Cada jogador paga $50 para ele(a).', effect: { type: 'collectFromAll', amount: 50 } },
  { id: 17, text: '🏅 {player} foi eleito(a) prefeito(a) de Araguari! Cada jogador paga $25.', effect: { type: 'collectFromAll', amount: 25 } },
  { id: 18, text: '🍕 {player} paga uma pizza para todo mundo! Pague $50 a cada jogador.', effect: { type: 'payToAll', amount: 50 } },
  { id: 19, text: '🌽 {player}, sua barraca de milho na Festa do Peão fez sucesso! Receba $120.', effect: { type: 'gainMoney', amount: 120 } },
  { id: 20, text: '📦 {player} vendeu seu lote no bairro Bosque! Receba $300.', effect: { type: 'gainMoney', amount: 300 } },
  { id: 21, text: '🎰 {player}, sorte grande na rifa da igreja! Receba $80.', effect: { type: 'gainMoney', amount: 80 } },
  { id: 22, text: '💼 {player} recebeu uma promoção no trabalho! Bônus de $250.', effect: { type: 'gainMoney', amount: 250 } },
  { id: 23, text: '🚜 {player}, safra recorde na fazenda! Lucro de $180.', effect: { type: 'gainMoney', amount: 180 } },
  { id: 24, text: '🏪 {player}, seu comércio na Av. Batalhão rendeu bem! Receba $130.', effect: { type: 'gainMoney', amount: 130 } },
  { id: 25, text: '🚗 {player} bateu o carro na rotatória do Centro! Pague $180 no conserto.', effect: { type: 'loseMoney', amount: 180 } },
  { id: 26, text: '🦷 {player} precisa de dentista de emergência! Pague $120.', effect: { type: 'loseMoney', amount: 120 } },
  { id: 27, text: '📱 {player} derrubou o celular no Rio Araguari! Compre outro por $250.', effect: { type: 'loseMoney', amount: 250 } },
  { id: 28, text: '🏠 {player}, goteira no seu telhado! Pague $90 para o encanador.', effect: { type: 'loseMoney', amount: 90 } },
  { id: 29, text: '⚡ {player}, conta de luz da CEMIG veio altíssima! Pague $110.', effect: { type: 'loseMoney', amount: 110 } },
  { id: 30, text: '🐶 O cachorro de {player} comeu o sofá! Pague $60 por um novo.', effect: { type: 'loseMoney', amount: 60 } },
  { id: 31, text: '🚌 {player}, pegue o ônibus na Rodoviária! Vá para a casa 25.', effect: { type: 'moveTo', position: 25, collectGo: false } },
  { id: 32, text: '✈️ {player}, embarque no Aeroporto Araguari! Vá para a casa 5.', effect: { type: 'moveTo', position: 5, collectGo: false } },
  { id: 33, text: '🏃 {player} entrou na corrida de rua no Centro! Avance 5 casas.', effect: { type: 'moveForward', steps: 5 } },
  { id: 34, text: '🚧 {player}, obra na estrada! Volte 2 casas.', effect: { type: 'moveBack', steps: 2 } },
  { id: 35, text: '🚨 {player} foi flagrado fazendo moto grau na Av. Minas Gerais! Vá para a Prisão!', effect: { type: 'goToJail' } },
  { id: 36, text: '📋 Mandado de busca para {player}! Vá direto para a Prisão!', effect: { type: 'goToJail' } },
  { id: 37, text: '🎄 Natal em Araguari! Cada jogador dá um presente de $30 para {player}.', effect: { type: 'collectFromAll', amount: 30 } },
  { id: 38, text: '🍺 {player} paga uma rodada de cerveja para todo mundo! Pague $40 a cada.', effect: { type: 'payToAll', amount: 40 } },
  { id: 39, text: '🏆 O time de {player} ganhou o campeonato regional! Cada jogador paga $60.', effect: { type: 'collectFromAll', amount: 60 } },
  { id: 40, text: '🎪 {player} patrocina a Festa Junina de Araguari! Pague $80 a cada jogador.', effect: { type: 'payToAll', amount: 80 } },
];

const RAILROAD_IDS = [5, 15, 25, 35];
const COLOR_GROUPS = {
  brown: [1, 3], lightblue: [6, 8, 9], pink: [11, 13, 14], orange: [16, 18, 19],
  red: [21, 23, 24], yellow: [26, 27, 29], green: [31, 32, 34], blue: [37, 39]
};

const BOARD_SPACES_RENT = {
  1: [4,20,60,180,320,500], 3: [8,40,120,360,640,900],
  6: [12,60,180,540,800,1100], 8: [12,60,180,540,800,1100], 9: [16,80,200,600,900,1200],
  11: [20,100,300,900,1250,1500], 13: [20,100,300,900,1250,1500], 14: [24,120,360,1000,1400,1800],
  16: [28,140,400,1100,1500,1900], 18: [28,140,400,1100,1500,1900], 19: [32,160,440,1200,1600,2000],
  21: [36,180,500,1400,1750,2100], 23: [36,180,500,1400,1750,2100], 24: [40,200,600,1500,1850,2200],
  26: [44,220,660,1600,1950,2300], 27: [44,220,660,1600,1950,2300], 29: [48,240,720,1700,2050,2400],
  31: [52,260,780,1800,2200,2550], 32: [52,260,780,1800,2200,2550], 34: [56,300,900,2000,2400,2800],
  37: [70,350,1000,2200,2600,3000], 39: [100,400,1200,2800,3400,4000]
};

const BOARD_SPACES_PRICES = {
  1:120,3:120,5:400,6:200,8:200,9:240,11:280,12:300,13:280,14:320,15:400,
  16:360,18:360,19:400,21:440,23:440,24:480,25:400,26:520,27:520,28:300,
  29:560,31:600,32:600,34:640,35:400,37:700,39:800
};

const BOARD_SPACES_HOUSE_COST = {
  1:100,3:100,6:100,8:100,9:100,11:200,13:200,14:200,16:200,18:200,19:200,
  21:300,23:300,24:300,26:300,27:300,29:300,31:400,32:400,34:400,37:400,39:400
};

const BOARD_SPACES_TYPES = {
  0:'go',1:'property',2:'chance',3:'property',4:'tax',5:'railroad',6:'property',
  7:'chance',8:'property',9:'property',10:'jail',11:'property',12:'utility',
  13:'property',14:'property',15:'railroad',16:'property',17:'tax',18:'property',
  19:'property',20:'parking',21:'property',22:'chance',23:'property',24:'property',
  25:'railroad',26:'property',27:'property',28:'utility',29:'property',30:'go-to-jail',
  31:'property',32:'property',33:'tax',34:'property',35:'railroad',36:'tax',
  37:'property',38:'tax',39:'property'
};

const BOARD_SPACES_COLORS = {
  1:'brown',3:'brown',6:'lightblue',8:'lightblue',9:'lightblue',
  11:'pink',13:'pink',14:'pink',16:'orange',18:'orange',19:'orange',
  21:'red',23:'red',24:'red',26:'yellow',27:'yellow',29:'yellow',
  31:'green',32:'green',34:'green',37:'blue',39:'blue'
};

const TAX_AMOUNTS = { 4: 200, 17: 200, 33: 250, 36: 250, 38: 100 };

function shuffleDeck(deck) {
  const s = [...deck];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

// === ROOMS ===
const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function createRoom(hostSocketId, hostName, hostColor, hostAvatar) {
  const code = generateRoomCode();
  rooms[code] = {
    code,
    hostId: hostSocketId,
    players: [{ socketId: hostSocketId, name: hostName, color: hostColor, avatar: hostAvatar, ready: true, connected: true }],
    started: false,
    gameState: null,
  };
  return code;
}

function getFullGameState(room) {
  return room.gameState;
}

function initGameState(room) {
  const players = room.players.map((p, i) => ({
    id: i + 1,
    socketId: p.socketId,
    name: p.name,
    color: p.color,
    avatar: p.avatar || '🚗',
    position: 0,
    money: 3000,
    inJail: false,
    jailTurns: 0,
    onVacation: false,
    bankrupt: false,
    connected: true,
  }));

  room.gameState = {
    players,
    currentPlayerIndex: 0,
    diceValues: [1, 1],
    diceTotal: null,
    ownership: {},
    buildings: {},
    mortgaged: {},
    newsCard: null,
    newsDeck: shuffleDeck(NEWS_CARDS),
    newsDeckIndex: 0,
    actionPrompt: null,
    message: null,
    log: [],
    auction: null,
  };
}

function calculateRent(gs, spaceId, diceTotal) {
  const ownerId = gs.ownership[spaceId];
  if (!ownerId || gs.mortgaged[spaceId]) return 0;
  
  const type = BOARD_SPACES_TYPES[spaceId];

  if (type === 'railroad' || type === 'utility') {
    return diceTotal * 50;
  }
  if (type === 'property') {
    const bld = gs.buildings[spaceId] || 0;
    return BOARD_SPACES_RENT[spaceId][bld];
  }
  return 0;
}

function applyNewsCard(gs, card, playerIdx) {
  const { effect } = card;
  const p = gs.players;

  switch (effect.type) {
    case 'gainMoney': p[playerIdx].money += effect.amount; break;
    case 'loseMoney': p[playerIdx].money -= effect.amount; break;
    case 'moveTo':
      if (effect.collectGo && effect.position === 0) p[playerIdx].money += 500;
      p[playerIdx].position = effect.position;
      if (effect.position === 20) p[playerIdx].onVacation = true;
      break;
    case 'moveForward':
      p[playerIdx].position = (p[playerIdx].position + effect.steps) % 40;
      break;
    case 'moveBack': {
      let np = p[playerIdx].position - effect.steps;
      if (np < 0) np += 40;
      p[playerIdx].position = np;
      break;
    }
    case 'goToJail':
      p[playerIdx].position = 10; p[playerIdx].inJail = true; p[playerIdx].jailTurns = 0;
      break;
    case 'collectFromAll': {
      const total = (p.length - 1) * effect.amount;
      p[playerIdx].money += total;
      p.forEach((pl, i) => { if (i !== playerIdx) pl.money -= effect.amount; });
      break;
    }
    case 'payToAll': {
      const total = (p.length - 1) * effect.amount;
      p[playerIdx].money -= total;
      p.forEach((pl, i) => { if (i !== playerIdx) pl.money += effect.amount; });
      break;
    }
  }
}

// === SOCKET EVENTS ===
io.on('connection', (socket) => {
  console.log(`✅ Conectado: ${socket.id}`);

  socket.on('createRoom', ({ name, color, avatar }, cb) => {
    const code = createRoom(socket.id, name, color, avatar);
    socket.join(code);
    cb({ code, players: rooms[code].players });
    console.log(`🏠 Sala ${code} criada por ${name}`);
  });

  socket.on('joinRoom', ({ code, name, color, avatar }, cb) => {
    const room = rooms[code];
    if (!room) return cb({ error: 'Sala não encontrada.' });
    
    if (room.started) {
      // Tentar reconectar jogador
      const disconnectedIdx = room.players.findIndex(p => p.name === name && p.color === color && p.connected === false);
      if (disconnectedIdx !== -1) {
        room.players[disconnectedIdx].socketId = socket.id;
        room.players[disconnectedIdx].connected = true;
        if (room.gameState && room.gameState.players[disconnectedIdx]) {
          room.gameState.players[disconnectedIdx].socketId = socket.id;
          room.gameState.players[disconnectedIdx].connected = true;
        }
        socket.join(code);
        io.to(code).emit('gameUpdate', getFullGameState(room));
        console.log(`🔌 ${name} reconectou na sala ${code}`);
        return cb({ code, players: room.players, reconnected: true, gameState: getFullGameState(room) });
      }
      return cb({ error: 'Jogo já começou ou nome/cor não correspondem a um jogador desconectado.' });
    }

    if (room.players.length >= 6) return cb({ error: 'Sala cheia (máximo 6).' });
    if (room.players.find(p => p.color === color)) return cb({ error: 'Cor já em uso.' });

    room.players.push({ socketId: socket.id, name, color, avatar, ready: true, connected: true });
    socket.join(code);
    io.to(code).emit('lobbyUpdate', { players: room.players });
    cb({ code, players: room.players });
    console.log(`👤 ${name} entrou na sala ${code}`);
  });

  socket.on('startGame', ({ code }) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) return;
    room.started = true;
    initGameState(room);
    io.to(code).emit('gameStarted', getFullGameState(room));
    console.log(`🎲 Jogo iniciado na sala ${code} com ${room.players.length} jogadores`);
  });

  socket.on('rollDice', ({ code }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const pi = gs.currentPlayerIndex;
    const player = gs.players[pi];
    if (player.socketId !== socket.id) return; // Not your turn
    if (gs.actionPrompt || gs.newsCard) return;

    // Generate duration of 1 second
    const duration = 1000;

    // Broadcast rolling animation
    io.to(code).emit('diceRolling', { duration });

    // Wait 'duration' seconds before calculating the result
    setTimeout(() => {
      if (player.onVacation) {
        player.onVacation = false;
        gs.actionPrompt = { type: 'info', message: `🏖️ ${player.name} está de Férias! Descansando...` };
        io.to(code).emit('gameUpdate', getFullGameState(room));
        return;
      }

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      const isDoubles = d1 === d2;

      gs.diceValues = [d1, d2];
      gs.diceTotal = total;

      if (player.inJail) {
        const jt = player.jailTurns + 1;
        if (isDoubles || jt >= 3) {
          player.inJail = false; player.jailTurns = 0;
          const fromPos = 10;
          let newPos = (10 + total) % 40;
          if (10 + total >= 40) player.money += 500;
          player.position = newPos;
          handleLanding(room, newPos, total, 10 + total >= 40);
          io.to(code).emit('animateMovement', { playerIdx: pi, fromPos, steps: total, diceTotal: total, diceValues: [d1, d2] });
          io.to(code).emit('gameUpdate', getFullGameState(room));
        } else {
          player.jailTurns = jt;
          const rem = 3 - jt;
          gs.actionPrompt = { type: 'info', message: `🔒 Dados: ${d1} e ${d2} — Não iguais! Preso. ${rem === 0 ? 'Próxima sai!' : `Restam ${rem}.`}` };
          io.to(code).emit('gameUpdate', getFullGameState(room));
        }
        return;
      }

      const startPos = player.position;
      let newPos = (startPos + total) % 40;
      const passedGo = (startPos + total) >= 40;
      if (passedGo) player.money += 500;
      player.position = newPos;

      handleLanding(room, newPos, total, passedGo);
      io.to(code).emit('animateMovement', { playerIdx: pi, fromPos: startPos, steps: total, diceTotal: total, diceValues: [d1, d2] });
      io.to(code).emit('gameUpdate', getFullGameState(room));
    }, 3000);
  });

  function handleLanding(room, spaceId, diceTotal, passedGo) {
    const gs = room.gameState;
    const pi = gs.currentPlayerIndex;
    const player = gs.players[pi];
    const type = BOARD_SPACES_TYPES[spaceId];
    const price = BOARD_SPACES_PRICES[spaceId];
    const isPurchasable = type === 'property' || type === 'utility' || type === 'railroad';

    if (isPurchasable) {
      const ownerId = gs.ownership[spaceId];
      if (!ownerId) {
        gs.actionPrompt = { type: 'buy', spaceId, price, canAfford: player.money >= price };
      } else if (ownerId !== player.id) {
        const rent = calculateRent(gs, spaceId, diceTotal);
        player.money -= rent;
        gs.players.find(p => p.id === ownerId).money += rent;
        const ownerName = gs.players.find(p => p.id === ownerId).name;
        gs.actionPrompt = { type: 'info', message: `Pagou $${rent} de aluguel para ${ownerName}!` };
        io.to(room.code || gs.roomCode).emit('playEffect', { type: 'coin-loss', target: null });
      } else {
        nextTurn(gs);
      }
    } else if (type === 'tax') {
      player.money -= TAX_AMOUNTS[spaceId];
      gs.actionPrompt = { type: 'info', message: `Pagou $${TAX_AMOUNTS[spaceId]} de taxas!` };
    } else if (type === 'go-to-jail') {
      player.position = 10; player.inJail = true; player.jailTurns = 0;
      gs.actionPrompt = { type: 'info', message: '🚔 Vá direto para a Prisão!' };
      io.to(room.code || gs.roomCode).emit('playEffect', { type: 'siren', target: null });
    } else if (type === 'parking') {
      player.onVacation = true;
      gs.actionPrompt = { type: 'info', message: '🏖️ Férias! Perde a próxima rodada.' };
    } else if (type === 'chance') {
      let idx = gs.newsDeckIndex;
      if (idx >= gs.newsDeck.length) { gs.newsDeck = shuffleDeck(NEWS_CARDS); idx = 0; }
      gs.newsCard = gs.newsDeck[idx];
      gs.newsDeckIndex = idx + 1;
      io.to(room.code || gs.roomCode).emit('playEffect', { type: 'paper', target: null });
    } else {
      const msg = passedGo ? 'Passou pelo Início e recebeu $500!' : null;
      if (msg) gs.actionPrompt = { type: 'info', message: msg };
      else nextTurn(gs);
    }
  }

  function nextTurn(gs) {
    gs.actionPrompt = null;
    gs.diceTotal = null;
    let next = (gs.currentPlayerIndex + 1) % gs.players.length;
    let attempts = 0;
    while (gs.players[next]?.bankrupt && attempts < gs.players.length) {
      next = (next + 1) % gs.players.length;
      attempts++;
    }
    gs.currentPlayerIndex = next;
  }

  socket.on('buyProperty', ({ code }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    if (!gs.actionPrompt || gs.actionPrompt.type !== 'buy') return;
    const player = gs.players[gs.currentPlayerIndex];
    if (player.socketId !== socket.id) return;

    const { spaceId, price } = gs.actionPrompt;
    player.money -= price;
    gs.ownership[spaceId] = player.id;
    nextTurn(gs);
    io.to(code).emit('gameUpdate', getFullGameState(room));
    io.to(code).emit('playEffect', { type: 'kaching', target: null });
  });

  socket.on('skipBuy', ({ code }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    
    gs.auction = {
      spaceId: gs.actionPrompt.spaceId,
      highestBid: Math.floor(gs.actionPrompt.price / 2),
      highestBidderId: null,
      participants: gs.players.filter(p => !p.bankrupt).map(p => p.id),
      active: true
    };
    gs.actionPrompt = null;
    
    io.to(code).emit('gameUpdate', getFullGameState(room));
  });

  socket.on('continueAction', ({ code }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const player = gs.players[gs.currentPlayerIndex];
    if (player.socketId !== socket.id) return;
    nextTurn(gs);
    io.to(code).emit('gameUpdate', getFullGameState(room));
  });

  socket.on('closeNewsCard', ({ code }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const player = gs.players[gs.currentPlayerIndex];
    if (player.socketId !== socket.id) return;
    if (gs.newsCard) {
      applyNewsCard(gs, gs.newsCard, gs.currentPlayerIndex);
      gs.newsCard = null;
    }
    nextTurn(gs);
    io.to(code).emit('gameUpdate', getFullGameState(room));
  });

  socket.on('buildHouse', ({ code, spaceId }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const player = gs.players[gs.currentPlayerIndex];
    if (player.socketId !== socket.id) return;

    const type = BOARD_SPACES_TYPES[spaceId];
    if (type !== 'property') return;
    if (gs.ownership[spaceId] !== player.id) return;

    const color = BOARD_SPACES_COLORS[spaceId];
    const group = COLOR_GROUPS[color];
    if (!group.every(id => gs.ownership[id] === player.id)) return;

    const current = gs.buildings[spaceId] || 0;
    if (current >= 5) return;

    const cost = BOARD_SPACES_HOUSE_COST[spaceId];
    if (player.money < cost) return;

    const minInGroup = Math.min(...group.map(id => gs.buildings[id] || 0));
    if (current > minInGroup) return;

    gs.buildings[spaceId] = current + 1;
    player.money -= cost;
    io.to(code).emit('gameUpdate', getFullGameState(room));
    io.to(code).emit('playEffect', { type: 'build-dust', target: { spaceId } });
  });

  socket.on('mortgage', ({ code, spaceId }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const player = gs.players[gs.currentPlayerIndex];
    if (player.socketId !== socket.id) return;
    if (gs.ownership[spaceId] !== player.id || gs.mortgaged[spaceId]) return;
    if ((gs.buildings[spaceId] || 0) > 0) return;

    const price = BOARD_SPACES_PRICES[spaceId];
    if (!price) return;

    const type = BOARD_SPACES_TYPES[spaceId];
    const isBlackCard = type === 'railroad' || type === 'utility';
    const value = isBlackCard ? price * 2 : Math.floor(price * 0.5);

    gs.mortgaged[spaceId] = true;
    player.money += value;
    io.to(code).emit('gameUpdate', getFullGameState(room));
  });

  socket.on('unmortgage', ({ code, spaceId }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const player = gs.players[gs.currentPlayerIndex];
    if (player.socketId !== socket.id) return;
    if (gs.ownership[spaceId] !== player.id || !gs.mortgaged[spaceId]) return;

    const type = BOARD_SPACES_TYPES[spaceId];
    const price = BOARD_SPACES_PRICES[spaceId];
    if (!price) return;
    
    const isBlackCard = type === 'railroad' || type === 'utility';
    const cost = isBlackCard ? Math.floor(price * 2.1) : Math.floor(price * 0.55);
    
    if (player.money < cost) return;

    gs.mortgaged[spaceId] = false;
    player.money -= cost;
    io.to(code).emit('gameUpdate', getFullGameState(room));
  });

  // === TRADE ===
  socket.on('proposeTrade', ({ code, trade }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const target = gs.players.find(p => p.id === trade.toPlayerId);
    if (!target) return;
    io.to(target.socketId).emit('tradeProposal', trade);
  });

  socket.on('acceptTrade', ({ code, trade }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const from = gs.players.find(p => p.id === trade.fromPlayerId);
    const to = gs.players.find(p => p.id === trade.toPlayerId);
    if (!from || !to) return;

    from.money = from.money - trade.offerMoney + trade.requestMoney;
    to.money = to.money + trade.offerMoney - trade.requestMoney;
    trade.offerProperties.forEach(id => { gs.ownership[id] = trade.toPlayerId; });
    trade.requestProperties.forEach(id => { gs.ownership[id] = trade.fromPlayerId; });

    gs.log = gs.log || [];
    gs.log.push({ id: Date.now(), icon: '🤝', message: `Troca entre ${from.name} e ${to.name}!`, timestamp: Date.now() });

    io.to(code).emit('gameUpdate', getFullGameState(room));
    io.to(code).emit('playEffect', { type: 'trade', target: null });
  });

  socket.on('rejectTrade', ({ code, trade }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    const from = gs.players.find(p => p.id === trade.fromPlayerId);
    if (from) io.to(from.socketId).emit('tradeRejected');
  });

  // === AUCTION ===
  const endAuction = (code) => {
    const room = rooms[code];
    if (!room) return;
    const gs = room.gameState;
    const auction = gs.auction;
    if (!auction || !auction.active) return;
    
    auction.active = false;
    
    if (auction.highestBidderId) {
      const winner = gs.players.find(p => p.id === auction.highestBidderId);
      if (winner) {
        winner.money -= auction.highestBid;
        gs.ownership[auction.spaceId] = winner.id;
        gs.log.push({ id: Date.now(), icon: '🔨', message: `${winner.name} arrematou por $${auction.highestBid}!`, timestamp: Date.now() });
      }
    } else {
      gs.log.push({ id: Date.now(), icon: '🔨', message: `Leilão encerrado sem lances.`, timestamp: Date.now() });
    }
    
    gs.auction = null;
    nextTurn(gs);
    io.to(code).emit('gameUpdate', getFullGameState(room));
  };

  socket.on('placeBid', ({ code, amount }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    if (!gs.auction || !gs.auction.active) return;
    
    const player = gs.players.find(p => p.socketId === socket.id);
    if (!player || !gs.auction.participants.includes(player.id)) return;
    
    if (player.money >= amount && amount > gs.auction.highestBid) {
      gs.auction.highestBid = amount;
      gs.auction.highestBidderId = player.id;
      io.to(code).emit('gameUpdate', getFullGameState(room));
    }
  });

  socket.on('withdrawAuction', ({ code }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const gs = room.gameState;
    if (!gs.auction || !gs.auction.active) return;
    
    const player = gs.players.find(p => p.socketId === socket.id);
    if (!player) return;
    
    gs.auction.participants = gs.auction.participants.filter(id => id !== player.id);
    
    if (gs.auction.participants.length === 0 || 
       (gs.auction.participants.length === 1 && gs.auction.participants[0] === gs.auction.highestBidderId)) {
      endAuction(code);
    } else {
      io.to(code).emit('gameUpdate', getFullGameState(room));
    }
  });

  // === VISUAL EFFECTS ===
  socket.on('broadcastEffect', ({ code, type, target }) => {
    socket.to(code).emit('playEffect', { type, target });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Desconectado: ${socket.id}`);
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        if (room.started) {
          room.players[idx].connected = false;
          if (room.gameState && room.gameState.players[idx]) {
            room.gameState.players[idx].connected = false;
          }
          io.to(code).emit('gameUpdate', getFullGameState(room));
          
          const allDisconnected = room.players.every(p => p.connected === false);
          if (allDisconnected) {
            delete rooms[code];
            console.log(`🗑️ Sala ${code} removida (todos desconectados)`);
          }
        } else {
          room.players.splice(idx, 1);
          if (room.players.length === 0) {
            delete rooms[code];
            console.log(`🗑️ Sala ${code} removida`);
          } else {
            if (room.hostId === socket.id) room.hostId = room.players[0].socketId;
            io.to(code).emit('lobbyUpdate', { players: room.players });
          }
        }
      }
    }
  });
});

// === GET LOCAL IP ===
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🎲 BANCO IMOBILIÁRIO - SERVIDOR 🎲    ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   IP Local: ${ip.padEnd(28)}║`);
  console.log(`║   Porta:    ${String(PORT).padEnd(28)}║`);
  console.log(`║   Acesse:   http://${ip}:${PORT}`.padEnd(43) + '║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
