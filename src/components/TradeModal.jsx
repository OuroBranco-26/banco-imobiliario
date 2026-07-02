import { useState } from 'react';
import { BOARD_SPACES } from '../data/boardData';
import './TradeModal.css';

const TradeModal = ({ players, currentPlayer, ownership, mortgaged, onPropose, onClose }) => {
  const [targetPlayerId, setTargetPlayerId] = useState(null);
  const [offerMoney, setOfferMoney] = useState(0);
  const [requestMoney, setRequestMoney] = useState(0);
  const [offerProperties, setOfferProperties] = useState([]);
  const [requestProperties, setRequestProperties] = useState([]);

  const otherPlayers = players.filter(p => p.id !== currentPlayer.id && !p.bankrupt);
  const targetPlayer = players.find(p => p.id === targetPlayerId);

  const myProperties = BOARD_SPACES.filter(s =>
    ownership[s.id] === currentPlayer.id && !mortgaged[s.id] && s.price
  );
  const targetProperties = targetPlayerId
    ? BOARD_SPACES.filter(s => ownership[s.id] === targetPlayerId && !mortgaged[s.id] && s.price)
    : [];

  const toggleOffer = (id) => {
    setOfferProperties(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleRequest = (id) => {
    setRequestProperties(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const canPropose = targetPlayerId &&
    (offerMoney > 0 || offerProperties.length > 0) &&
    (requestMoney > 0 || requestProperties.length > 0) &&
    offerMoney <= currentPlayer.money;

  const handlePropose = () => {
    if (!canPropose) return;
    onPropose({
      fromPlayerId: currentPlayer.id,
      toPlayerId: targetPlayerId,
      offerMoney: Number(offerMoney),
      requestMoney: Number(requestMoney),
      offerProperties,
      requestProperties,
    });
  };

  return (
    <div className="trade-overlay" onClick={onClose}>
      <div className="trade-modal" onClick={e => e.stopPropagation()}>
        <div className="trade-header">
          <h2>🤝 Propor Troca</h2>
          <button className="trade-close" onClick={onClose}>✕</button>
        </div>

        {/* Select target player */}
        <div className="trade-section">
          <h3>Negociar com:</h3>
          <div className="trade-player-select">
            {otherPlayers.map(p => (
              <button
                key={p.id}
                className={`trade-player-btn ${targetPlayerId === p.id ? 'selected' : ''}`}
                style={{ borderColor: p.color, color: targetPlayerId === p.id ? '#fff' : p.color,
                         backgroundColor: targetPlayerId === p.id ? p.color : 'transparent' }}
                onClick={() => setTargetPlayerId(p.id)}
              >
                {p.avatar} {p.name}
              </button>
            ))}
          </div>
        </div>

        {targetPlayerId && (
          <div className="trade-columns">
            {/* My offer */}
            <div className="trade-column offer">
              <h3 style={{ color: currentPlayer.color }}>
                {currentPlayer.avatar} Você Oferece
              </h3>
              <div className="trade-money-input">
                <label>Dinheiro: R$</label>
                <input
                  type="number"
                  min="0"
                  max={currentPlayer.money}
                  value={offerMoney}
                  onChange={e => setOfferMoney(Math.min(Number(e.target.value), currentPlayer.money))}
                />
              </div>
              <div className="trade-property-list">
                {myProperties.length === 0 && <p className="trade-empty">Sem propriedades</p>}
                {myProperties.map(s => (
                  <button
                    key={s.id}
                    className={`trade-prop-btn ${offerProperties.includes(s.id) ? 'selected' : ''}`}
                    onClick={() => toggleOffer(s.id)}
                  >
                    <span>{s.name}</span>
                    <span className="trade-prop-price">${s.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* What I want */}
            <div className="trade-column request">
              <h3 style={{ color: targetPlayer?.color }}>
                {targetPlayer?.avatar} Você Quer
              </h3>
              <div className="trade-money-input">
                <label>Dinheiro: R$</label>
                <input
                  type="number"
                  min="0"
                  max={targetPlayer?.money || 0}
                  value={requestMoney}
                  onChange={e => setRequestMoney(Math.min(Number(e.target.value), targetPlayer?.money || 0))}
                />
              </div>
              <div className="trade-property-list">
                {targetProperties.length === 0 && <p className="trade-empty">Sem propriedades</p>}
                {targetProperties.map(s => (
                  <button
                    key={s.id}
                    className={`trade-prop-btn ${requestProperties.includes(s.id) ? 'selected' : ''}`}
                    onClick={() => toggleRequest(s.id)}
                  >
                    <span>{s.name}</span>
                    <span className="trade-prop-price">${s.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="trade-footer">
          <button className="trade-cancel-btn" onClick={onClose}>Cancelar</button>
          <button
            className="trade-propose-btn"
            disabled={!canPropose}
            onClick={handlePropose}
          >
            Enviar Proposta
          </button>
        </div>
      </div>
    </div>
  );
};

/* Incoming trade proposal */
export const TradeIncoming = ({ trade, players, onAccept, onReject }) => {
  const from = players.find(p => p.id === trade.fromPlayerId);
  const to = players.find(p => p.id === trade.toPlayerId);

  return (
    <div className="trade-overlay">
      <div className="trade-modal incoming">
        <div className="trade-header">
          <h2>🤝 Proposta de Troca</h2>
        </div>
        <p className="trade-from">
          <strong style={{ color: from?.color }}>{from?.avatar} {from?.name}</strong> quer negociar com você!
        </p>

        <div className="trade-columns">
          <div className="trade-column offer">
            <h3 style={{ color: from?.color }}>Oferece:</h3>
            {trade.offerMoney > 0 && <p className="trade-money-display">💰 R${trade.offerMoney}</p>}
            {trade.offerProperties.map(id => {
              const s = BOARD_SPACES.find(sp => sp.id === id);
              return <div key={id} className="trade-prop-display">{s?.name} (${s?.price})</div>;
            })}
          </div>
          <div className="trade-column request">
            <h3 style={{ color: to?.color }}>Quer:</h3>
            {trade.requestMoney > 0 && <p className="trade-money-display">💰 R${trade.requestMoney}</p>}
            {trade.requestProperties.map(id => {
              const s = BOARD_SPACES.find(sp => sp.id === id);
              return <div key={id} className="trade-prop-display">{s?.name} (${s?.price})</div>;
            })}
          </div>
        </div>

        <div className="trade-footer">
          <button className="trade-cancel-btn" onClick={onReject}>❌ Recusar</button>
          <button className="trade-propose-btn" onClick={onAccept}>✅ Aceitar</button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
