import { useState } from 'react';
import './StartScreen.css';

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

const StartScreen = ({ onStartGame, onBack }) => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [playerColors, setPlayerColors] = useState([
    PLAYER_COLORS[0].value,
    PLAYER_COLORS[1].value,
    PLAYER_COLORS[2].value,
    PLAYER_COLORS[3].value,
  ]);
  const [playerAvatars, setPlayerAvatars] = useState([
    PLAYER_AVATARS[0].emoji,
    PLAYER_AVATARS[1].emoji,
    PLAYER_AVATARS[2].emoji,
    PLAYER_AVATARS[3].emoji,
  ]);

  const updateName = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const updateColor = (index, color) => {
    const newColors = [...playerColors];
    newColors[index] = color;
    setPlayerColors(newColors);
  };

  const updateAvatar = (index, avatar) => {
    const newAvatars = [...playerAvatars];
    newAvatars[index] = avatar;
    setPlayerAvatars(newAvatars);
  };

  const handleStart = () => {
    const players = [];
    for (let i = 0; i < numPlayers; i++) {
      players.push({
        id: i + 1,
        name: playerNames[i].trim() || `Jogador ${i + 1}`,
        color: playerColors[i],
        avatar: playerAvatars[i],
        position: 0,
        money: 3000,
        inJail: false,
        jailTurns: 0,
        onVacation: false,
        bankrupt: false,
      });
    }
    onStartGame(players);
  };

  const usedColors = playerColors.slice(0, numPlayers);
  const usedAvatars = playerAvatars.slice(0, numPlayers);

  return (
    <div className="start-screen">
      <button 
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 100
          }}
        >
          ⬅ Voltar ao Menu
        </button>
      <div className="start-container glass-panel">
        <div className="start-header">
          <h1 className="start-title">BANCO</h1>
          <h1 className="start-title accent">IMOBILIÁRIO</h1>
          <p className="start-subtitle">Araguari - MG</p>
        </div>

        <div className="player-count">
          <label>Número de Jogadores</label>
          <div className="count-buttons">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`count-btn ${numPlayers === n ? 'active' : ''}`}
                onClick={() => setNumPlayers(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="player-inputs">
          {Array.from({ length: numPlayers }).map((_, i) => (
            <div key={i} className="player-input-row">
              <div className="player-number" style={{ backgroundColor: playerColors[i] }}>
                {i + 1}
              </div>
              <input
                type="text"
                placeholder={`Jogador ${i + 1}`}
                value={playerNames[i]}
                onChange={(e) => updateName(i, e.target.value)}
                className="name-input"
                maxLength={15}
              />
              <div className="color-picker">
                {PLAYER_COLORS.map(c => {
                  const isUsed = usedColors.includes(c.value) && playerColors[i] !== c.value;
                  return (
                    <button
                      key={c.value}
                      className={`color-dot ${playerColors[i] === c.value ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => !isUsed && updateColor(i, c.value)}
                      disabled={isUsed}
                      title={c.name}
                    />
                  );
                })}
              </div>
              <div className="avatar-picker">
                {PLAYER_AVATARS.map(a => {
                  const isUsed = usedAvatars.includes(a.emoji) && playerAvatars[i] !== a.emoji;
                  return (
                    <button
                      key={a.emoji}
                      className={`avatar-dot ${playerAvatars[i] === a.emoji ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                      onClick={() => !isUsed && updateAvatar(i, a.emoji)}
                      disabled={isUsed}
                      title={a.name}
                    >
                      {a.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button className="start-btn" onClick={handleStart}>
          🎲 Iniciar Jogo
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
