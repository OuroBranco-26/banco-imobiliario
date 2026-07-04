import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Board from './components/Board';
import StartScreen from './components/StartScreen';
import LobbyScreen from './components/LobbyScreen';
import NewsCardModal from './components/NewsCardModal';
import GameLog from './components/GameLog';
import VictoryScreen from './components/VictoryScreen';
import TradeModal, { TradeIncoming } from './components/TradeModal';
import AuctionModal from './components/AuctionModal';
import TutorialModal from './components/TutorialModal';
import useSound from './hooks/useSound';
import useBackgroundMusic from './hooks/useBackgroundMusic';
import { BOARD_SPACES, COLOR_GROUPS, RAILROAD_IDS } from './data/boardData';
import { NEWS_CARDS, shuffleDeck } from './data/newsCards';

function App() {
  const [mode, setMode] = useState(null); // null, 'local', 'online'
  const [gameStarted, setGameStarted] = useState(false);
  const socketRef = useRef(null);
  const [roomCode, setRoomCode] = useState('');
  const [mySocketId, setMySocketId] = useState('');

  // === GAME STATE ===
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [ownership, setOwnership] = useState({});
  const [buildings, setBuildings] = useState({});
  const [mortgaged, setMortgaged] = useState({});
  const [actionPrompt, setActionPrompt] = useState(null);
  const [diceTotal, setDiceTotal] = useState(null);
  const [newsCard, setNewsCard] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [indicators, setIndicators] = useState([]);
  const [visualEffects, setVisualEffects] = useState([]);
  const [gameLog, setGameLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [incomingTrade, setIncomingTrade] = useState(null);
  const [auction, setAuction] = useState(null);
  
  // === TIMER & TUTORIAL STATE ===
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(false);
  const [speedMode, setSpeedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const speedModeRef = useRef(false);
  const timeLeftRef = useRef(10);
  
  const auctionTimerRef = useRef(null);
  const boardSectionRef = useRef(null);
  const sound = useSound();
  const music = useBackgroundMusic();

  // Local-only state
  const [newsDeck, setNewsDeck] = useState(() => shuffleDeck(NEWS_CARDS));
  const [newsDeckIndex, setNewsDeckIndex] = useState(0);

  const currentPlayer = players[currentPlayerIndex] || {};

  // Am I the current player? (online check)
  const isMyTurn = mode === 'local' || (currentPlayer.socketId === mySocketId);

  // === CONNECT SOCKET ===
  const connectSocket = () => {
    // With Vite proxy configured, we can just connect to the current host in dev.
    // In production, we use the VITE_BACKEND_URL environment variable.
    const backendUrl = import.meta.env.VITE_BACKEND_URL || undefined;
    const s = io(backendUrl);
    socketRef.current = s;
    s.on('connect', () => setMySocketId(s.id));
    return s;
  };

  // === ONLINE: APPLY SERVER STATE ===
  const pendingStateRef = useRef(null);
  const animatingRef = useRef(false);

  const applyServerState = (gs) => {
    // If animating, queue the state to apply after animation
    if (animatingRef.current) {
      pendingStateRef.current = gs;
      return;
    }
    setPlayers(gs.players);
    setCurrentPlayerIndex(gs.currentPlayerIndex);
    setDiceValues(gs.diceValues);
    setDiceTotal(gs.diceTotal);
    setOwnership(gs.ownership);
    setBuildings(gs.buildings);
    setMortgaged(gs.mortgaged || {});
    setActionPrompt(gs.actionPrompt);
    setNewsCard(gs.newsCard);
    if (gs.log) setGameLog(gs.log);
    if (gs.auction !== undefined) setAuction(gs.auction);
    setIsMoving(false);
  };

  const applyPendingState = () => {
    if (pendingStateRef.current) {
      const gs = pendingStateRef.current;
      pendingStateRef.current = null;
      setPlayers(gs.players);
      setCurrentPlayerIndex(gs.currentPlayerIndex);
      setDiceValues(gs.diceValues);
      setDiceTotal(gs.diceTotal);
      setOwnership(gs.ownership);
      setBuildings(gs.buildings);
      setMortgaged(gs.mortgaged || {});
      setActionPrompt(gs.actionPrompt);
      setNewsCard(gs.newsCard);
    }
    setIsMoving(false);
    animatingRef.current = false;
  };

  const handleAnimateMovement = async ({ playerIdx, fromPos, steps, diceValues: dv, diceTotal: dt }) => {
    animatingRef.current = true;
    setIsMoving(true);
    setDiceValues(dv);
    setDiceTotal(dt);

    let pos = fromPos;
    for (let s = 0; s < steps; s++) {
      await new Promise(r => setTimeout(r, 200));
      pos = (pos + 1) % 40;
      const newPos = pos;
      setPlayers(prev => prev.map((p, i) => {
        if (i !== playerIdx) return p;
        const updated = { ...p, position: newPos };
        if (newPos === 0) updated.money = p.money + 500;
        return updated;
      }));
    }
    await new Promise(r => setTimeout(r, 150));
    applyPendingState();
  };

  // === ONLINE HANDLERS ===
  const handleOnlineGameStart = (gs, code) => {
    setRoomCode(code);
    applyServerState(gs);
    setGameStarted(true);
    music.play();
  };

  // Simulate dice rolling visual effect
  const simulateDiceRoll = async (duration = 3000) => {
    setIsRollingDice(duration); // Store duration for CSS variable
    const loops = duration / 100;
    for (let i = 0; i < loops; i++) {
      setDiceValues([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      await wait(100);
    }
    setIsRollingDice(false);
  };

  const triggerEffect = (type, target, broadcast = false) => {
    const id = Date.now() + Math.random();
    setVisualEffects(prev => [...prev, { id, type, ...target }]);
    setTimeout(() => {
      setVisualEffects(prev => prev.filter(e => e.id !== id));
    }, 1500);
    
    if (broadcast && mode === 'online' && socketRef.current) {
      socketRef.current.emit('broadcastEffect', { code: roomCode, type, target });
    }
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (mode === 'online' && socket) {
      socket.on('gameUpdate', applyServerState);
      socket.on('animateMovement', handleAnimateMovement);
      socket.on('diceRolling', ({ duration }) => simulateDiceRoll(duration));
      socket.on('playEffect', ({ type, target }) => triggerEffect(type, target, false));
      return () => {
        socket.off('gameUpdate', applyServerState);
        socket.off('animateMovement', handleAnimateMovement);
        socket.off('diceRolling');
        socket.off('playEffect');
      };
    }
  }, [mode]);
  useEffect(() => {
    const updateIndicators = () => {
      const container = boardSectionRef.current;
      if (!container) return;
      
      const padding = 15;
      const size = 24;

      const st = container.scrollTop;
      const sl = container.scrollLeft;
      const ch = container.clientHeight;
      const cw = container.clientWidth;

      // The visible bounds inside the scrolling container
      const vTop = st;
      const vBottom = st + ch;
      const vLeft = sl;
      const vRight = sl + cw;

      const newInd = [];

      players.forEach(p => {
        const el = document.getElementById(`token-${p.id}`);
        if (!el) return;
        
        // We need the token's position relative to the scrolling container content
        // Since both token and container are in the DOM, we can use offsetTop/offsetLeft
        // But the token is nested. A reliable way is to use getBoundingClientRect differences
        const cRect = container.getBoundingClientRect();
        const tRect = el.getBoundingClientRect();
        
        // Token's relative position inside the visible viewport of the container
        const relTop = tRect.top - cRect.top;
        const relBottom = tRect.bottom - cRect.top;
        const relLeft = tRect.left - cRect.left;
        const relRight = tRect.right - cRect.left;

        const isOutLeft = relRight < 0;
        const isOutRight = relLeft > cw;
        const isOutTop = relBottom < 0;
        const isOutBottom = relTop > ch;

        if (isOutLeft || isOutRight || isOutTop || isOutBottom) {
          // Token center relative to the content (absolute coordinates inside container)
          const tokenAbsY = st + relTop + (tRect.height / 2);
          const tokenAbsX = sl + relLeft + (tRect.width / 2);

          // Default position: match token's absolute position but clamp it to viewport
          let top = Math.max(vTop + padding, Math.min(vBottom - padding - size, tokenAbsY));
          let left = Math.max(vLeft + padding, Math.min(vRight - padding - size, tokenAbsX));
          
          let arrow = '';
          if (isOutLeft) { left = vLeft + padding; arrow = '←'; }
          else if (isOutRight) { left = vRight - padding - size; arrow = '→'; }
          
          if (isOutTop) { top = vTop + padding; arrow = '↑'; }
          else if (isOutBottom) { top = vBottom - padding - size; arrow = '↓'; }
          
          if (isOutTop && isOutLeft) arrow = '↖';
          if (isOutTop && isOutRight) arrow = '↗';
          if (isOutBottom && isOutLeft) arrow = '↙';
          if (isOutBottom && isOutRight) arrow = '↘';

          newInd.push({ id: p.id, color: p.color, top, left, arrow });
        }
      });

      // Prevent overlapping by spreading indicators on the same edge
      const spacing = 28;
      
      const resolveOverlap = (arrows, axis) => {
        arrows.forEach(arr => {
          const group = newInd.filter(i => i.arrow === arr);
          if (group.length > 1) {
            group.sort((a, b) => a[axis] - b[axis]);
            const center = group.reduce((sum, item) => sum + item[axis], 0) / group.length;
            const startPos = center - ((group.length - 1) * spacing) / 2;
            group.forEach((item, idx) => {
              item[axis] = startPos + (idx * spacing);
            });
          }
        });
      };

      resolveOverlap(['↑', '↓'], 'left'); // Spread horizontally on top/bottom
      resolveOverlap(['←', '→'], 'top');  // Spread vertically on left/right

      // Stagger corners slightly so they don't overlap perfectly
      ['↖', '↗', '↙', '↘'].forEach(c => {
         const corners = newInd.filter(i => i.arrow === c);
         if (corners.length > 1) {
            corners.forEach((item, idx) => {
               item.left += idx * 20;
               item.top += idx * 10;
            });
         }
      });

      setIndicators(newInd);
    };

    const container = boardSectionRef.current;
    
    // Use capture: true to catch all scroll events from any scrollable child (board-section or app-container)
    window.addEventListener('scroll', updateIndicators, { capture: true });
    window.addEventListener('resize', updateIndicators);
    updateIndicators();
    
    let rafId;
    if (isMoving) {
       const loop = () => { updateIndicators(); rafId = requestAnimationFrame(loop); };
       loop();
    }

    return () => {
      window.removeEventListener('scroll', updateIndicators, { capture: true });
      window.removeEventListener('resize', updateIndicators);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [players, isMoving]);
  // === MODE SELECTION ===
  const selectMode = (m) => {
    setMode(m);
    if (m === 'online') connectSocket();
  };

  const handleBackToMenu = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setMode(null);
    setGameStarted(false);
  };

  // === LOCAL: GAME LOGIC ===
  const addLog = (icon, message) => {
    setGameLog(prev => [...prev.slice(-29), { id: Date.now() + Math.random(), icon, message, timestamp: Date.now() }]);
  };

  const checkBankruptcy = (updatedPlayers, debtorIdx, creditorId) => {
    const p = updatedPlayers[debtorIdx];
    if (p.money >= 0 || p.bankrupt) return updatedPlayers;

    // Check if player can mortgage anything to cover debt
    const canMortgage = BOARD_SPACES.some(s => 
      ownership[s.id] === p.id && !mortgaged[s.id] && (buildings[s.id] || 0) === 0 && s.price
    );
    if (canMortgage) return updatedPlayers; // Player can still mortgage

    // Bankrupt!
    sound.playBankrupt();
    addLog('💀', `${p.name} foi à falência!`);
    
    // Transfer all properties
    const newOwnership = { ...ownership };
    const newMortgaged = { ...mortgaged };
    Object.keys(newOwnership).forEach(sid => {
      if (newOwnership[sid] === p.id) {
        if (creditorId && creditorId !== 'bank') {
          newOwnership[sid] = creditorId; // Transfer to creditor
        } else {
          delete newOwnership[sid]; // Return to bank
          delete newMortgaged[sid];
        }
      }
    });
    setOwnership(newOwnership);
    setMortgaged(newMortgaged);

    const result = updatedPlayers.map((pl, i) => i === debtorIdx ? { ...pl, bankrupt: true } : pl);
    
    // Check victory
    const alive = result.filter(pl => !pl.bankrupt);
    if (alive.length === 1) {
      setTimeout(() => {
        sound.playVictory();
        setWinner(alive[0]);
      }, 500);
    }
    return result;
  };

  // === LOCAL AUCTION LOGIC ===
  const startAuctionLocal = (spaceId) => {
    setActionPrompt(null);
    const initialParticipants = players.filter(p => !p.bankrupt).map(p => p.id);
    
    if (initialParticipants.length === 0) {
      nextTurnLocal();
      return;
    }

    setAuction({
      spaceId,
      highestBid: 10,
      highestBidderId: null,
      participants: initialParticipants,
      active: true,
      timeLeft: 10
    });

    if (auctionTimerRef.current) clearInterval(auctionTimerRef.current);
    auctionTimerRef.current = setInterval(() => {
      setAuction(prev => {
        if (!prev) {
          clearInterval(auctionTimerRef.current);
          return null;
        }
        const nextTime = prev.timeLeft - 1;
        if (nextTime <= 0) {
          clearInterval(auctionTimerRef.current);
          // Can't easily call endAuctionLocal here because state might be stale
          // We will use a useEffect to watch the timer, but setting state is fine
          // Actually, we can just defer it:
          setTimeout(() => endAuctionLocal(prev), 0);
          return null;
        }
        return { ...prev, timeLeft: nextTime };
      });
    }, 1000);
  };

  const endAuctionLocal = (auctionState) => {
    if (auctionState.highestBidderId) {
      const winner = players.find(p => p.id === auctionState.highestBidderId);
      if (winner) {
        setPlayers(prev => prev.map(p => p.id === winner.id ? { ...p, money: p.money - auctionState.highestBid } : p));
        setOwnership(prev => ({ ...prev, [auctionState.spaceId]: winner.id }));
        addLog('🔨', `${winner.name} arrematou por $${auctionState.highestBid}!`);
      }
    } else {
      addLog('🔨', `Leilão encerrado sem lances.`);
    }
    setAuction(null);
    nextTurnLocal();
  };

  const placeBidLocal = (amount, playerId) => {
    setAuction(prev => {
      if (!prev || !prev.active) return prev;
      const player = players.find(p => p.id === playerId);
      if (player.money >= amount && amount > prev.highestBid) {
        return { ...prev, highestBid: amount, highestBidderId: playerId, timeLeft: 10 };
      }
      return prev;
    });
  };

  const withdrawAuctionLocal = (playerId) => {
    setAuction(prev => {
      if (!prev || !prev.active) return prev;
      const nextParticipants = prev.participants.filter(id => id !== playerId);
      
      if (nextParticipants.length === 0 || (nextParticipants.length === 1 && nextParticipants[0] === prev.highestBidderId)) {
        clearInterval(auctionTimerRef.current);
        setTimeout(() => endAuctionLocal({ ...prev, participants: nextParticipants }), 0);
        return null;
      }
      return { ...prev, participants: nextParticipants };
    });
  };

  const nextTurnLocal = () => {
    setActionPrompt(null);
    setDiceTotal(null);
    setCurrentPlayerIndex(prev => {
      let next = (prev + 1) % players.length;
      let attempts = 0;
      while (players[next]?.bankrupt && attempts < players.length) {
        next = (next + 1) % players.length;
        attempts++;
      }
      return next;
    });
  };

  const handleStartLocal = (playersFromScreen) => {
    setPlayers(playersFromScreen);
    setGameStarted(true);
    music.play();
  };

  // Step-by-step movement animation using async/await
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const animateMove = async (playerIdx, startPos, steps) => {
    setIsMoving(true);
    let pos = startPos;
    for (let s = 0; s < steps; s++) {
      await wait(200);
      pos = (pos + 1) % 40;
      const newPos = pos;
      setPlayers(prev => prev.map((p, i) => {
        if (i !== playerIdx) return p;
        const updated = { ...p, position: newPos };
        if (newPos === 0) {
          updated.money = p.money + 500;
          sound.playJackpot();
        }
        return updated;
      }));
    }
    await wait(150); // Small pause before landing action
    setIsMoving(false);
    return pos;
  };

  const rollDiceLocal = async () => {
    if (actionPrompt || newsCard || isMoving || isRollingDice) return;
    const player = players[currentPlayerIndex];

    if (player.onVacation) {
      setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, onVacation: false } : p));
      setActionPrompt({ type: 'info', message: `🏖️ ${player.name} está de Férias!` });
      return;
    }

    const duration = Math.floor(Math.random() * 3000) + 1000;
    sound.playDiceRoll();
    await simulateDiceRoll(duration);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const isDoubles = d1 === d2;
    setDiceValues([d1, d2]);
    setDiceTotal(total);
    addLog('🎲', `${player.name} rolou ${d1} e ${d2} (total: ${total})`);

    if (player.inJail) {
      const jt = player.jailTurns + 1;
      if (isDoubles || jt >= 3) {
        setPlayers(prev => prev.map((p, i) =>
          i === currentPlayerIndex ? { ...p, inJail: false, jailTurns: 0 } : p
        ));
        const finalPos = await animateMove(currentPlayerIndex, 10, total);
        const passedGo = (10 + total) >= 40;
        handleLandingLocal(finalPos, total, passedGo);
      } else {
        setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, jailTurns: jt } : p));
        const rem = 3 - jt;
        setActionPrompt({ type: 'info', message: `🔒 ${d1} e ${d2} — Não iguais! ${rem === 0 ? 'Próxima sai!' : `Restam ${rem}.`}` });
      }
      return;
    }

    const startPos = player.position;
    const finalPos = await animateMove(currentPlayerIndex, startPos, total);
    const passedGo = (startPos + total) >= 40;
    handleLandingLocal(finalPos, total, passedGo);
  };

  const calculateRentLocal = (space, dt) => {
    const ownerId = ownership[space.id];
    if (!ownerId || mortgaged[space.id]) return 0;
    if (space.type === 'railroad' || space.type === 'utility') {
      return dt * 50;
    }
    if (space.type === 'property') return space.rent[buildings[space.id] || 0];
    return 0;
  };

  const handleLandingLocal = (spaceId, dt, passedGo) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId);
    const isPurchasable = space.type === 'property' || space.type === 'utility' || space.type === 'railroad';
    const player = players[currentPlayerIndex];

    if (isPurchasable) {
      const ownerId = ownership[spaceId];
      if (!ownerId) {
        setActionPrompt({ type: 'buy', space, player, spaceId: space.id, price: space.price, canAfford: player.money >= space.price });
      } else if (ownerId !== player.id) {
        const rent = calculateRentLocal(space, dt);
        sound.playCoinDrop();
        triggerEffect('coin-loss', { playerId: player.id }, true);
        triggerEffect('coin-gain', { playerId: ownerId }, true);
        setPlayers(prev => {
          const updated = prev.map(p => {
            if (p.id === player.id) return { ...p, money: p.money - rent };
            if (p.id === ownerId) return { ...p, money: p.money + rent };
            return p;
          });
          return checkBankruptcy(updated, currentPlayerIndex, ownerId);
        });
        const ownerName = players.find(p => p.id === ownerId).name;
        addLog('💸', `${player.name} pagou $${rent} de aluguel para ${ownerName}`);
        setActionPrompt({ type: 'info', message: `Pagou $${rent} de aluguel para ${ownerName}!` });
      } else { nextTurnLocal(); }
    } else if (space.type === 'tax') {
      setPlayers(prev => {
        const updated = prev.map((p, i) => i === currentPlayerIndex ? { ...p, money: p.money - space.price } : p);
        return checkBankruptcy(updated, currentPlayerIndex, 'bank');
      });
      addLog('💰', `${player.name} pagou $${space.price} de taxas`);
      setActionPrompt({ type: 'info', message: `Pagou $${space.price} de taxas!` });
    } else if (space.type === 'go-to-jail') {
      sound.playSiren();
      addLog('🚔', `${player.name} foi para o Presídio!`);
      setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, position: 10, inJail: true, jailTurns: 0 } : p));
      setActionPrompt({ type: 'info', message: '🚔 Vá para o Presídio!' });
    } else if (space.type === 'parking') {
      setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, onVacation: true } : p));
      setActionPrompt({ type: 'info', message: '🏖️ Férias! Perde a próxima rodada.' });
    } else if (space.type === 'chance') {
      sound.playPaperFlip();
      let idx = newsDeckIndex;
      if (idx >= newsDeck.length) { setNewsDeck(shuffleDeck(NEWS_CARDS)); idx = 0; }
      setNewsCard(newsDeck[idx]);
      setNewsDeckIndex(idx + 1);
    } else {
      if (passedGo) setActionPrompt({ type: 'info', message: 'Passou pelo Início e recebeu $500!' });
      else nextTurnLocal();
    }
  };

  const buyPropertyLocal = () => {
    if (!actionPrompt || actionPrompt.type !== 'buy') return;
    const { space, player } = actionPrompt;
    sound.playKaChing();
    addLog('🏠', `${player.name} comprou ${space.name} por $${space.price}`);
    setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, money: p.money - space.price } : p));
    setOwnership(prev => ({ ...prev, [space.id]: player.id }));
    nextTurnLocal();
  };

  const applyNewsCardLocal = () => {
    if (!newsCard) return;
    const { effect } = newsCard;
    const pi = currentPlayerIndex;
    const player = players[pi];

    switch (effect.type) {
      case 'gainMoney': setPlayers(prev => prev.map((p, i) => i === pi ? { ...p, money: p.money + effect.amount } : p)); break;
      case 'loseMoney': setPlayers(prev => prev.map((p, i) => i === pi ? { ...p, money: p.money - effect.amount } : p)); break;
      case 'moveTo':
        setPlayers(prev => prev.map((p, i) => {
          if (i !== pi) return p;
          const m = effect.collectGo && effect.position === 0 ? p.money + 500 : p.money;
          return { ...p, position: effect.position, money: m, onVacation: effect.position === 20 ? true : p.onVacation };
        })); break;
      case 'moveForward': setPlayers(prev => prev.map((p, i) => i === pi ? { ...p, position: (p.position + effect.steps) % 40 } : p)); break;
      case 'moveBack': setPlayers(prev => prev.map((p, i) => { if (i !== pi) return p; let np = p.position - effect.steps; if (np < 0) np += 40; return { ...p, position: np }; })); break;
      case 'goToJail': setPlayers(prev => prev.map((p, i) => i === pi ? { ...p, position: 10, inJail: true, jailTurns: 0 } : p)); break;
      case 'collectFromAll': setPlayers(prev => prev.map((p, i) => i === pi ? { ...p, money: p.money + (prev.length - 1) * effect.amount } : { ...p, money: p.money - effect.amount })); break;
      case 'payToAll': setPlayers(prev => prev.map((p, i) => i === pi ? { ...p, money: p.money - (prev.length - 1) * effect.amount } : { ...p, money: p.money + effect.amount })); break;
    }
    setNewsCard(null);
    nextTurnLocal();
  };

  const canBuildLocal = (spaceId) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId);
    if (!space || space.type !== 'property' || ownership[spaceId] !== currentPlayer.id) return false;
    const group = COLOR_GROUPS[space.color];
    if (!group.every(id => ownership[id] === currentPlayer.id)) return false;
    const current = buildings[spaceId] || 0;
    if (current >= 5 || currentPlayer.money < space.houseCost) return false;
    const minInGroup = Math.min(...group.map(id => buildings[id] || 0));
    return current <= minInGroup;
  };

  const buildLocal = (spaceId) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId);
    if (!canBuildLocal(spaceId)) return;
    sound.playHammer();
    triggerEffect('build-dust', { spaceId }, true);
    addLog('🔨', `${currentPlayer.name} construiu em ${space.name}`);
    setBuildings(prev => ({ ...prev, [spaceId]: (prev[spaceId] || 0) + 1 }));
    setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, money: p.money - space.houseCost } : p));
  };

  // === LOCAL: MORTGAGE ===
  const getMortgageableLocal = () => {
    return BOARD_SPACES.filter(s => {
      if (ownership[s.id] !== currentPlayer.id || mortgaged[s.id]) return false;
      if ((buildings[s.id] || 0) > 0) return false;
      return true;
    });
  };

  const getUnmortgageableLocal = () => {
    return BOARD_SPACES.filter(s => {
      if (ownership[s.id] !== currentPlayer.id || !mortgaged[s.id]) return false;
      const isBlackCard = s.type === 'railroad' || s.type === 'utility';
      const cost = isBlackCard ? Math.floor(s.price * 2.1) : Math.floor(s.price * 0.55);
      return currentPlayer.money >= cost;
    });
  };

  const mortgageLocal = (spaceId) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId);
    const isBlackCard = space.type === 'railroad' || space.type === 'utility';
    const value = isBlackCard ? space.price * 2 : Math.floor(space.price * 0.5);
    setMortgaged(prev => ({ ...prev, [spaceId]: true }));
    setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, money: p.money + value } : p));
  };

  const unmortgageLocal = (spaceId) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId);
    const isBlackCard = space.type === 'railroad' || space.type === 'utility';
    const cost = isBlackCard ? Math.floor(space.price * 2.1) : Math.floor(space.price * 0.55);
    setMortgaged(prev => ({ ...prev, [spaceId]: false }));
    setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, money: p.money - cost } : p));
  };

  // === TRADE LOCAL ===
  const handleTradePropose = (trade) => {
    if (mode === 'local') {
      // In local mode, show the incoming trade to the target player immediately
      setShowTradeModal(false);
      setIncomingTrade(trade);
    } else {
      socketRef.current?.emit('proposeTrade', { code: roomCode, trade });
      setShowTradeModal(false);
    }
  };

  const handleTradeAccept = () => {
    if (!incomingTrade) return;
    const t = incomingTrade;
    sound.playTrade();
    addLog('🤝', `Troca aceita entre jogadores!`);
    
    // Transfer money
    setPlayers(prev => prev.map(p => {
      if (p.id === t.fromPlayerId) return { ...p, money: p.money - t.offerMoney + t.requestMoney };
      if (p.id === t.toPlayerId) return { ...p, money: p.money + t.offerMoney - t.requestMoney };
      return p;
    }));
    // Transfer properties
    setOwnership(prev => {
      const newOwn = { ...prev };
      t.offerProperties.forEach(id => { newOwn[id] = t.toPlayerId; });
      t.requestProperties.forEach(id => { newOwn[id] = t.fromPlayerId; });
      return newOwn;
    });
    setIncomingTrade(null);
  };

  const handleTradeReject = () => {
    addLog('❌', 'Proposta de troca recusada');
    setIncomingTrade(null);
  };

  // === ONLINE: ACTIONS ===
  const rollDiceOnline = () => socketRef.current?.emit('rollDice', { code: roomCode });
  const buyPropertyOnline = () => socketRef.current?.emit('buyProperty', { code: roomCode });
  const skipBuyOnline = () => socketRef.current?.emit('skipBuy', { code: roomCode });
  const continueOnline = () => socketRef.current?.emit('continueAction', { code: roomCode });
  const closeNewsOnline = () => socketRef.current?.emit('closeNewsCard', { code: roomCode });
  const buildOnline = (spaceId) => socketRef.current?.emit('buildHouse', { code: roomCode, spaceId });
  const mortgageOnline = (spaceId) => socketRef.current?.emit('mortgage', { code: roomCode, spaceId });
  const unmortgageOnline = (spaceId) => socketRef.current?.emit('unmortgage', { code: roomCode, spaceId });

  // === UNIFIED HANDLERS ===
  const handleRoll = mode === 'local' ? rollDiceLocal : rollDiceOnline;
  const handleBuy = mode === 'local' ? buyPropertyLocal : buyPropertyOnline;
  const handleSkip = () => {
    if (mode === 'local') {
      const spaceId = actionPrompt.spaceId;
      startAuctionLocal(spaceId);
    } else {
      skipBuyOnline();
    }
  };
  const handleContinue = mode === 'local' ? nextTurnLocal : continueOnline;
  const handleCloseNews = mode === 'local' ? applyNewsCardLocal : closeNewsOnline;
  const handleBuild = mode === 'local' ? buildLocal : buildOnline;
  const handleMortgage = mode === 'local' ? mortgageLocal : mortgageOnline;

  const handleAuctionBid = (amount, localPlayerId) => {
    if (mode === 'local') placeBidLocal(amount, localPlayerId);
    else socketRef.current?.emit('placeBid', { code: roomCode, amount });
  };

  const handleAuctionWithdraw = (localPlayerId) => {
    if (mode === 'local') withdrawAuctionLocal(localPlayerId);
    else socketRef.current?.emit('withdrawAuction', { code: roomCode });
  };
  const handleUnmortgage = mode === 'local' ? unmortgageLocal : unmortgageOnline;

  // === STATUS ===
  const getStatusLabel = () => {
    if (currentPlayer.bankrupt) return '💀 Falido';
    if (currentPlayer.inJail) {
      const a = currentPlayer.jailTurns;
      if (a >= 3) return '🔓 Última tentativa!';
      return `🔒 Presídio — Tentativa ${a + 1} de 3`;
    }
    if (currentPlayer.onVacation) return '🏖️ De Férias';
    return null;
  };

  const getBuildable = () => {
    if (mode === 'online') {
      return BOARD_SPACES.filter(s => {
        if (s.type !== 'property' || ownership[s.id] !== currentPlayer.id) return false;
        const group = COLOR_GROUPS[s.color];
        if (!group.every(id => ownership[id] === currentPlayer.id)) return false;
        const current = buildings[s.id] || 0;
        if (current >= 5 || currentPlayer.money < s.houseCost) return false;
        const minInGroup = Math.min(...group.map(id => buildings[id] || 0));
        return current <= minInGroup;
      });
    }
    return BOARD_SPACES.filter(s => canBuildLocal(s.id));
  };

  // === TIMER & SPEED MODE LOGIC ===
  useEffect(() => {
    if (!speedMode && gameStarted) {
      if (currentPlayerIndex > 0 || (currentPlayerIndex === 0 && diceTotal > 0)) {
        setSpeedMode(true);
        speedModeRef.current = true;
      }
    }
  }, [currentPlayerIndex, diceTotal, gameStarted, speedMode]);

  useEffect(() => {
    // Reset timer on turn change or prompt change
    let newTime = 10;
    if (actionPrompt && actionPrompt.type === 'buy') newTime = 5;
    else if (actionPrompt && actionPrompt.type === 'info') newTime = 7;
    else if (newsCard) newTime = 7;
    
    setTimeLeft(newTime);
    timeLeftRef.current = newTime;
  }, [currentPlayerIndex, actionPrompt, newsCard]);

  useEffect(() => {
    if (!gameStarted || !isMyTurn || !speedMode) return;
    if (auction && auction.active) return;
    if (incomingTrade || showTradeModal) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = prev - 1;
        timeLeftRef.current = nextTime;
        if (nextTime <= 0) {
          clearInterval(timer);
          // Time's up! Execute default action
          if (!diceTotal) handleRoll();
          else if (actionPrompt && actionPrompt.type === 'buy') handleSkip();
          else if (actionPrompt && actionPrompt.type === 'info') handleContinue();
          else if (newsCard) handleCloseNews();
          else handleContinue();
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isMyTurn, speedMode, auction, incomingTrade, showTradeModal, diceTotal, actionPrompt, newsCard]);

  // === TUTORIAL LOGIC ===
  useEffect(() => {
    if (gameStarted && !tutorialSeen) {
      setShowTutorial(true);
      setTutorialSeen(true);
    }
  }, [gameStarted, tutorialSeen]);

  // === RENDER ===

  // Mode selection screen
  if (!mode) {
    return (
      <div className="mode-screen">
        <div className="mode-container glass-panel">
          <div className="mode-header">
            <h1 className="mode-title">BANCO</h1>
            <h1 className="mode-title accent">IMOBILIÁRIO</h1>
            <p className="mode-subtitle">Araguari - MG</p>
          </div>
          <button className="mode-btn" onClick={() => selectMode('local')}>
            <span className="mode-icon">🎮</span>
            <div><strong>Jogo Local</strong><br/><small>Mesmo dispositivo, até 4 jogadores</small></div>
          </button>
          <button className="mode-btn" onClick={() => selectMode('online')}>
            <span className="mode-icon">🌐</span>
            <div><strong>Jogo em Rede</strong><br/><small>Via WiFi, até 6 jogadores</small></div>
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Versão Atual 1.3.0 (03/07/2026)
          </div>
        </div>
      </div>
    );
  }

  // Local start screen
  if (mode === 'local' && !gameStarted) {
    return <StartScreen onStartGame={handleStartLocal} onBack={handleBackToMenu} />;
  }

  // Online lobby
  if (mode === 'online' && !gameStarted) {
    return <LobbyScreen socket={socketRef.current} onGameStart={handleOnlineGameStart} onBack={handleBackToMenu} />;
  }

  // === GAME SCREEN ===
  const buildable = isMyTurn ? getBuildable() : [];
  const mortgageable = isMyTurn ? getMortgageableLocal() : []; // Note: in online mode we could add a getMortgageableOnline but for now we can share logic since it just filters BOARD_SPACES based on ownership and buildings. Oh wait, getMortgageableLocal uses state. We'll reuse it.
  
  // Update getMortgageable/getUnmortgageable to use the correct logic
  const mortgageableList = isMyTurn ? BOARD_SPACES.filter(s => {
    if (ownership[s.id] !== currentPlayer.id || mortgaged[s.id]) return false;
    if ((buildings[s.id] || 0) > 0) return false;
    return true;
  }) : [];

  const unmortgageableList = isMyTurn ? BOARD_SPACES.filter(s => {
    if (ownership[s.id] !== currentPlayer.id || !mortgaged[s.id]) return false;
    const cost = Math.floor(s.price * 0.55);
    return currentPlayer.money >= cost;
  }) : [];

  return (
    <div className="app-container" style={{ '--theme-color': currentPlayer?.color || 'transparent' }}>
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      <div className="board-section glass-panel" ref={boardSectionRef} style={{ position: 'relative' }}>
        
        {/* Speed Mode Timer */}
        {speedMode && gameStarted && (
          <div className="speed-timer" style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
            background: timeLeft <= 3 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0,0,0,0.6)',
            padding: '5px 12px', borderRadius: '20px',
            color: 'white', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)',
            transition: 'background 0.3s ease',
            animation: timeLeft <= 3 && isMyTurn ? 'musicPulse 1s infinite' : 'none'
          }}>
            ⏱️ {timeLeft}s {isMyTurn ? '(Sua Vez!)' : ''}
          </div>
        )}

        <div className="board-outer-wrapper">
          <Board players={players} ownership={ownership} buildings={buildings} mortgaged={mortgaged} />
        </div>
        
        {/* Out of bounds indicators */}
        {indicators.map(ind => (
          <div 
            key={`ind-${ind.id}`}
            className="player-indicator"
            style={{ 
              top: ind.top, left: ind.left, 
              backgroundColor: ind.color,
              boxShadow: `0 0 10px ${ind.color}`
            }}
          >
            {ind.arrow}
          </div>
        ))}
      </div>

      <div className="ui-section glass-panel">
        <div className="ui-scroll-content">
          <header className="header">
            <div className="header-controls">
              {mode === 'online' && <span className="room-badge">Sala: {roomCode}</span>}
              <div className="music-controls">
                <button 
                  className={`music-btn ${music.isPlaying ? 'playing' : ''}`}
                  onClick={music.toggle}
                  title={music.isPlaying ? 'Pausar música' : 'Tocar música'}
                >
                  {music.isPlaying ? '🎵' : '🔇'}
                </button>
                {music.isPlaying && (
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="100"
                    value={Math.round(music.volume * 100)}
                    onChange={e => music.setVolume(Number(e.target.value) / 100)}
                    title={`Volume: ${Math.round(music.volume * 100)}%`}
                  />
                )}
                <button 
                  className="disconnect-btn"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja sair do jogo?')) {
                      handleBackToMenu();
                    }
                  }}
                  title="Desconectar / Voltar ao Menu"
                  style={{
                    background: 'rgba(239, 68, 68, 0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    color: 'white',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    marginLeft: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🚪 Sair
                </button>
              </div>
            </div>
          </header>

        {getStatusLabel() && (
          <div className="controls">
            <div className={`status-indicator ${currentPlayer.onVacation ? 'vacation' : 'jail'}`}>
              {getStatusLabel()}
            </div>
          </div>
        )}

        {/* Build */}
        {buildable.length > 0 && !actionPrompt && !newsCard && isMyTurn && (
          <div className="build-panel">
            <h3>🏠 Construir</h3>
            <div className="build-list">
              {buildable.map(space => {
                const current = buildings[space.id] || 0;
                const label = current === 4 ? 'Hotel' : `Casa ${current + 1}`;
                return (
                  <button key={space.id} className="build-btn" onClick={() => handleBuild(space.id)}>
                    <span>{space.name}</span>
                    <span className="build-cost">{label} — ${space.houseCost}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mortgage */}
        {mortgageableList.length > 0 && !actionPrompt && !newsCard && isMyTurn && (
          <div className="mortgage-panel">
            <h3>💰 Hipotecar</h3>
            <p className="mortgage-info">Receba 50% do valor do imóvel. Não recebe aluguel.</p>
            <div className="mortgage-list">
              {mortgageableList.map(space => {
                const isBlackCard = space.type === 'railroad' || space.type === 'utility';
                const gain = isBlackCard ? space.price * 2 : Math.floor(space.price * 0.5);
                return (
                  <button key={space.id} className="mortgage-btn" onClick={() => handleMortgage(space.id)}>
                    <span>{space.name}</span>
                    <span className="mortgage-value gain">+${gain}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Unmortgage */}
        {unmortgageableList.length > 0 && !actionPrompt && !newsCard && isMyTurn && (
          <div className="mortgage-panel">
            <h3>💸 Desipotecar</h3>
            <p className="mortgage-info">Pague 55% do valor do imóvel para recuperar.</p>
            <div className="mortgage-list">
              {unmortgageableList.map(space => {
                const isBlackCard = space.type === 'railroad' || space.type === 'utility';
                const cost = isBlackCard ? Math.floor(space.price * 2.1) : Math.floor(space.price * 0.55);
                return (
                  <button key={space.id} className="mortgage-btn unmortgage" onClick={() => handleUnmortgage(space.id)}>
                    <span>{space.name}</span>
                    <span className="mortgage-value">-${cost}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Prompt */}
        {actionPrompt && (
          <div className="action-panel">
            {actionPrompt.type === 'buy' && isMyTurn && (
              <>
                <h3>Comprar {BOARD_SPACES.find(s => s.id === actionPrompt.spaceId)?.name}?</h3>
                <p>Preço: <strong>${actionPrompt.price}</strong></p>
                <div className="action-buttons">
                  <button className="btn-buy" onClick={handleBuy}>Comprar</button>
                  <button className="btn-skip" onClick={handleSkip}>Passar</button>
                </div>
              </>
            )}
            {(actionPrompt.type === 'rent' || actionPrompt.type === 'info') && (
              <>
                <h3>Aviso</h3>
                <p>{actionPrompt.message}</p>
                {isMyTurn && <button className="btn-ok" onClick={handleContinue}>Continuar</button>}
              </>
            )}
          </div>
        )}
        {/* Trade Button */}
        {isMyTurn && !actionPrompt && !newsCard && !isMoving && !isRollingDice && !currentPlayer.bankrupt && (
          <button className="trade-btn" onClick={() => setShowTradeModal(true)}>
            🤝 Propor Troca
          </button>
        )}

        <div className="players-list">
          {players.map(p => (
            <div key={p.id} className={`player-card ${p.socketId === mySocketId ? 'is-me' : ''} ${p.bankrupt ? 'bankrupt' : ''}`} style={{ borderLeftColor: p.color }}>
              <div className="player-info">
                <span className="player-name">
                  <div className="avatar-container">
                    {p.avatar && <span className="player-avatar">{p.avatar}</span>}
                    {p.inJail && <span className="jail-bars-overlay">⛓️</span>}
                  </div>
                  <span className="player-name">{p.name}</span>
                  {visualEffects.filter(e => e.playerId === p.id).map(e => (
                    <div key={e.id} className="effect-container">
                      <span className={e.type === 'coin-loss' ? 'effect-coin-loss' : 'effect-coin'}>🪙</span>
                    </div>
                  ))}
                  {p.socketId === mySocketId && mode === 'online' && ' (Você)'}
                </span>
                <span className="player-money">${p.money}</span>
              </div>
              <div className="player-properties">
                {Object.keys(ownership).filter(sid => ownership[sid] === p.id).length} imóveis
              </div>
            </div>
          ))}
        </div>

        {/* Game Log */}
        <GameLog logs={gameLog} />
        </div>
      </div>

      <NewsCardModal card={newsCard} playerName={currentPlayer.name} onClose={isMyTurn ? handleCloseNews : undefined} />

      {/* Victory Screen */}
      {winner && (
        <VictoryScreen
          winner={winner}
          players={players}
          ownership={ownership}
          onPlayAgain={() => {
            setWinner(null);
            setGameStarted(false);
            setMode(null);
            setPlayers([]);
            setOwnership({});
            setBuildings({});
            setMortgaged({});
            setGameLog([]);
            setCurrentPlayerIndex(0);
            setDiceValues([1, 1]);
            setDiceTotal(null);
            setActionPrompt(null);
            setNewsCard(null);
          }}
        />
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal
          players={players}
          currentPlayer={currentPlayer}
          ownership={ownership}
          mortgaged={mortgaged}
          onPropose={handleTradePropose}
          onClose={() => setShowTradeModal(false)}
        />
      )}

      {/* Incoming Trade */}
      {incomingTrade && (
        <TradeIncoming
          trade={incomingTrade}
          players={players}
          onAccept={handleTradeAccept}
          onReject={handleTradeReject}
        />
      )}

      {/* Auction Modal */}
      {auction && auction.active && (
        <AuctionModal
          auction={auction}
          players={players}
          myId={mode === 'local' ? players[currentPlayerIndex]?.id : players.find(p => p.socketId === mySocketId)?.id}
          isLocalMode={mode === 'local'}
          onBid={handleAuctionBid}
          onWithdraw={handleAuctionWithdraw}
        />
      )}

      {/* Floating Dice Panel moved to root so position:fixed works perfectly */}
      <div className="floating-dice">
        <div className="dice-container" style={{ '--player-color': currentPlayer.color }}>
          <div className="dice-wrapper">
            <div className={`dice ${isRollingDice ? 'rolling' : ''}`} style={dice1Style}>
              <div className="dice-face front"></div><div className="dice-face back"></div><div className="dice-face right"></div><div className="dice-face left"></div><div className="dice-face top"></div><div className="dice-face bottom"></div>
            </div>
            <div className={`dice ${isRollingDice ? 'rolling' : ''}`} style={dice2Style}>
              <div className="dice-face front"></div><div className="dice-face back"></div><div className="dice-face right"></div><div className="dice-face left"></div><div className="dice-face top"></div><div className="dice-face bottom"></div>
            </div>
          </div>
          {diceTotal !== null && !isRollingDice && <div className="dice-total">Total: <strong>{diceTotal}</strong> casas</div>}

          {isMyTurn && (
            <button
              className="roll-btn"
              onClick={handleRoll}
              disabled={actionPrompt !== null || newsCard !== null || isMoving || isRollingDice || (auction && auction.active)}
              style={{ opacity: (actionPrompt || newsCard || isMoving || isRollingDice || (auction && auction.active)) ? 0.5 : 1 }}
            >
              {(auction && auction.active) ? 'Em Leilão...' : isRollingDice ? 'Rolando...' : isMoving ? 'Movendo...' : currentPlayer.onVacation ? '🏖️ Férias...' : currentPlayer.inJail ? '🚓 Sair do Presídio' : 'Rolar Dados'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
