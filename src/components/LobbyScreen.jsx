import { useState } from 'react';
import './LobbyScreen.css';

const PLAYER_COLORS = [
  { name: 'Vermelho', value: '#f43f5e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Laranja', value: '#f97316' },
];

const PLAYER_AVATARS = [
  { name: 'Carrinho', emoji: '🚗' },
  { name: 'Chapéu', emoji: '🎩' },
  { name: 'Cachorro', emoji: '🐕' },
  { name: 'Navio', emoji: '🚢' },
  { name: 'Bota', emoji: '👢' },
  { name: 'Chave', emoji: '🔑' },
];

const LobbyScreen = ({ socket, onGameStart }) => {
  const [screen, setScreen] = useState('menu'); // menu, create, join, waiting
  const [name, setName] = useState('');
  const [color, setColor] = useState(PLAYER_COLORS[0].value);
  const [avatar, setAvatar] = useState(PLAYER_AVATARS[0].emoji);
  const [roomCode, setRoomCode] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) { setError('Digite seu nome!'); return; }
    socket.emit('createRoom', { name: name.trim(), color, avatar }, (res) => {
      if (res.error) { setError(res.error); return; }
      setCurrentCode(res.code);
      setLobbyPlayers(res.players);
      setIsHost(true);
      setScreen('waiting');
      setError('');

      socket.on('lobbyUpdate', ({ players }) => setLobbyPlayers(players));
      socket.on('gameStarted', (gs) => onGameStart(gs, res.code));
    });
  };

  const handleJoin = () => {
    if (!name.trim()) { setError('Digite seu nome!'); return; }
    if (!roomCode.trim()) { setError('Digite o código da sala!'); return; }
    socket.emit('joinRoom', { code: roomCode.trim().toUpperCase(), name: name.trim(), color, avatar }, (res) => {
      if (res.error) { setError(res.error); return; }
      setCurrentCode(res.code);
      setLobbyPlayers(res.players);
      setIsHost(false);
      setScreen('waiting');
      setError('');

      socket.on('lobbyUpdate', ({ players }) => setLobbyPlayers(players));
      socket.on('gameStarted', (gs) => onGameStart(gs, res.code));
    });
  };

  const handleStartGame = () => {
    socket.emit('startGame', { code: currentCode });
  };

  return (
    <div className="lobby-screen">
      <div className="lobby-container glass-panel">
        <div className="lobby-header">
          <h1 className="lobby-title">BANCO</h1>
          <h1 className="lobby-title accent">IMOBILIÁRIO</h1>
          <p className="lobby-subtitle">🌐 Multiplayer — Araguari, MG</p>
        </div>

        {error && <div className="lobby-error">{error}</div>}

        {/* MENU */}
        {screen === 'menu' && (
          <div className="lobby-section">
            <div className="input-group">
              <label>Seu Nome</label>
              <input
                type="text"
                placeholder="Digite seu nome..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="lobby-input"
                maxLength={15}
              />
            </div>

            <div className="input-group">
              <label>Sua Cor</label>
              <div className="color-row">
                {PLAYER_COLORS.map(c => (
                  <button
                    key={c.value}
                    className={`color-option ${color === c.value ? 'selected' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Sua Peça</label>
              <div className="color-row">
                {PLAYER_AVATARS.map(a => (
                  <button
                    key={a.emoji}
                    className={`avatar-option ${avatar === a.emoji ? 'selected' : ''}`}
                    onClick={() => setAvatar(a.emoji)}
                    title={a.name}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-buttons">
              <button className="lobby-btn primary" onClick={() => { setError(''); setScreen('create'); handleCreate(); }}>
                🏠 Criar Sala
              </button>
              <button className="lobby-btn secondary" onClick={() => { setError(''); setScreen('join'); }}>
                🔗 Entrar na Sala
              </button>
            </div>
          </div>
        )}

        {/* JOIN */}
        {screen === 'join' && (
          <div className="lobby-section">
            <div className="input-group">
              <label>Código da Sala</label>
              <input
                type="text"
                placeholder="Ex: AB1C"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                className="lobby-input code-input"
                maxLength={4}
              />
            </div>
            <div className="menu-buttons">
              <button className="lobby-btn primary" onClick={handleJoin}>Entrar</button>
              <button className="lobby-btn ghost" onClick={() => setScreen('menu')}>Voltar</button>
            </div>
          </div>
        )}

        {/* WAITING ROOM */}
        {screen === 'waiting' && (
          <div className="lobby-section">
            <div className="room-code-display">
              <span className="code-label">Código da Sala:</span>
              <span className="code-value">{currentCode}</span>
            </div>

            <div className="waiting-players">
              <h3>Jogadores ({lobbyPlayers.length}/6)</h3>
              {lobbyPlayers.map((p, i) => (
                <div key={i} className="waiting-player">
                  <div className="wp-dot" style={{ backgroundColor: p.color }}>{p.avatar || ''}</div>
                  <span>{p.name}</span>
                  {p.socketId === socket.id && <span className="you-tag">Você</span>}
                </div>
              ))}
            </div>

            {isHost ? (
              <button
                className="lobby-btn primary"
                onClick={handleStartGame}
                disabled={lobbyPlayers.length < 2}
                style={{ opacity: lobbyPlayers.length < 2 ? 0.5 : 1 }}
              >
                🎲 Iniciar Jogo ({lobbyPlayers.length} jogadores)
              </button>
            ) : (
              <p className="waiting-text">Aguardando o anfitrião iniciar...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
